
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    // Buscar o plano
    const plan = await db.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { message: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    if (plan.price === 0 || plan.name === 'free' || plan.name === 'personalizado') {
      return NextResponse.json(
        { message: 'Este plano não está disponível para compra online' },
        { status: 400 }
      );
    }

    // Verificar se o plano tem stripePriceId configurado
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { message: 'Plano não configurado corretamente. Entre em contato com o suporte.' },
        { status: 400 }
      );
    }

    // Verificar se já existe um Stripe Customer para este usuário
    let customerId: string | undefined;
    
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        stripeCustomerId: { not: null }
      }
    });

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
          companyName: session.user.companyName || ''
        }
      });
      customerId = customer.id;
    }

    // Obter a origin do request para URLs de redirect
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://www.recruitai.com.br';

    // Criar sessão de checkout do Stripe usando o stripePriceId
    // Métodos de pagamento: Cartão e Boleto
    // Nota: PIX precisa ser habilitado no Stripe Dashboard antes de usar
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_options: {
        boleto: {
          expires_after_days: 3
        }
      }
    });

    // Verificar se já existe subscription para este usuário
    const userSubscription = await db.subscription.findFirst({
      where: { userId: session.user.id }
    });

    if (userSubscription) {
      // Atualizar subscription existente
      await db.subscription.update({
        where: { id: userSubscription.id },
        data: {
          stripeCustomerId: customerId,
          stripeCheckoutSessionId: checkoutSession.id,
          planId: plan.id,
        }
      });
    } else {
      // Criar nova subscription
      await db.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          stripeCustomerId: customerId,
          stripeCheckoutSessionId: checkoutSession.id,
          status: 'pending',
          jobsCreatedThisMonth: 0
        }
      });
    }

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
