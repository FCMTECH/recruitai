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

    // Buscar a subscription do usuário
    const subscription = await db.subscription.findFirst({
      where: { userId: session.user.id },
      include: { plan: true }
    });

    if (!subscription) {
      return NextResponse.json(
        { message: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    if (!subscription.plan.isCustom) {
      return NextResponse.json(
        { message: 'Este não é um plano personalizado' },
        { status: 400 }
      );
    }

    if (subscription.status === 'active') {
      return NextResponse.json(
        { message: 'Pagamento já foi realizado' },
        { status: 400 }
      );
    }

    const planPrice = subscription.plan.price;
    if (planPrice <= 0) {
      return NextResponse.json(
        { message: 'Plano gratuito não requer pagamento' },
        { status: 400 }
      );
    }

    // Verificar ou criar Stripe Customer
    let customerId: string | undefined;
    
    if (subscription.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
          companyName: (session.user as any).companyName || ''
        }
      });
      customerId = customer.id;
      
      // Salvar o customerId
      await db.subscription.update({
        where: { id: subscription.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://www.recruitai.com.br';

    // Criar sessão de checkout para pagamento único (suporta PIX)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // Pagamento único para suportar PIX
      payment_method_types: ['card', 'boleto', 'pix'], // PIX habilitado
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: subscription.plan.displayName,
              description: `Plano personalizado - ${subscription.plan.jobLimit} vagas/mês`,
            },
            unit_amount: Math.round(planPrice * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&custom=true`,
      cancel_url: `${origin}/dashboard/profile?canceled=true`,
      metadata: {
        userId: session.user.id,
        subscriptionId: subscription.id,
        planId: subscription.plan.id,
        planName: subscription.plan.name,
        isCustomPlan: 'true'
      },
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
          subscriptionId: subscription.id,
          planId: subscription.plan.id,
          isCustomPlan: 'true'
        }
      },
      billing_address_collection: 'required',
      payment_method_options: {
        boleto: {
          expires_after_days: 3
        },
        pix: {
          expires_after_seconds: 86400 // 24 horas
        }
      }
    });

    // Atualizar subscription com session ID
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      }
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de pagamento personalizado:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    );
  }
}
