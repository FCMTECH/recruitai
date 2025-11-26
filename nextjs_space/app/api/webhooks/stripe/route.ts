
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { message: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Processar eventos do Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { message: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing userId or planId in checkout session metadata');
    return;
  }

  const stripeSubscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const paymentStatus = session.payment_status;

  // Buscar a subscription do Stripe para obter detalhes completos
  const stripeSubscription: any = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Determinar status baseado no payment_status
  // Se o pagamento foi confirmado (cartão), ativa imediatamente
  // Se está pendente (boleto), mantém como pending até o invoice.paid
  let subscriptionStatus = 'pending';
  if (paymentStatus === 'paid') {
    subscriptionStatus = 'active';
  }

  // Atualizar ou criar subscription no banco de dados
  const updatedSubscription = await prisma.subscription.upsert({
    where: {
      stripeCustomerId: customerId
    },
    update: {
      stripeSubscriptionId: stripeSubscriptionId,
      status: subscriptionStatus,
      startDate: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      endDate: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(),
      planId: planId
    },
    create: {
      userId: userId,
      planId: planId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscriptionId,
      status: subscriptionStatus,
      startDate: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      endDate: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(),
      jobsCreatedThisMonth: 0
    },
    include: {
      plan: true,
    }
  });

  // Enviar e-mail de confirmação quando o pagamento for aprovado
  if (subscriptionStatus === 'active') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, companyName: true, name: true }
      });

      if (user?.email) {
        const planName = updatedSubscription.plan.displayName;
        const amount = (session.amount_total || 0) / 100;
        
        await sendEmail({
          to: user.email,
          subject: 'Confirmação de Pagamento - RecruitAI',
          html: `
            <h2>Pagamento Confirmado!</h2>
            <p>Olá ${user.companyName || user.name},</p>
            <p>Seu pagamento foi processado com sucesso!</p>
            <hr>
            <p><strong>Plano:</strong> ${planName}</p>
            <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <hr>
            <p>Sua assinatura está ativa e você já pode utilizar todos os recursos do seu plano.</p>
            <p><strong>Nota Fiscal:</strong> A nota fiscal será enviada em breve para este e-mail.</p>
            <p>Obrigado por escolher RecruitAI!</p>
            <p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Acessar Dashboard</a></p>
          `,
          text: `Pagamento confirmado! Plano: ${planName} - Valor: R$ ${amount.toFixed(2)}. A nota fiscal será enviada em breve.`,
        });
      }
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de confirmação:', emailError);
      // Não falhar a operação se o e-mail não for enviado
    }
  }

  console.log(`Subscription ${subscriptionStatus === 'active' ? 'activated' : 'created (pending payment)'} for user ${userId}`);
}

async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId: stripeSubscription.id
    }
  });

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  const sub: any = stripeSubscription;

  // Mapear status do Stripe para nosso status
  let status = 'active';
  if (stripeSubscription.status === 'past_due') {
    status = 'past_due';
  } else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
    status = 'canceled';
  } else if (stripeSubscription.status === 'trialing') {
    status = 'trial';
  }

  await prisma.subscription.update({
    where: {
      id: subscription.id
    },
    data: {
      status: status,
      startDate: sub.current_period_start ? new Date(sub.current_period_start * 1000) : undefined,
      endDate: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined
    }
  });

  console.log(`Subscription updated: ${stripeSubscription.id}`);
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId: stripeSubscription.id
    }
  });

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  await prisma.subscription.update({
    where: {
      id: subscription.id
    },
    data: {
      status: 'canceled',
      endDate: new Date()
    }
  });

  console.log(`Subscription canceled: ${stripeSubscription.id}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const inv: any = invoice;
  const subscriptionId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
  
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId: subscriptionId
    }
  });

  if (!subscription) return;

  // Resetar contador de vagas criadas no novo período
  const now = new Date();
  const lastReset = subscription.lastResetDate;
  
  if (!lastReset || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        jobsCreatedThisMonth: 0,
        lastResetDate: now,
        status: 'active'
      }
    });
  }

  console.log(`Invoice paid for subscription: ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const inv: any = invoice;
  const subscriptionId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
  
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: {
      stripeSubscriptionId: subscriptionId
    }
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: {
      id: subscription.id
    },
    data: {
      status: 'past_due'
    }
  });

  console.log(`Payment failed for subscription: ${subscriptionId}`);
}
