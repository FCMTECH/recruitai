
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

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

  // Buscar a subscription do Stripe para obter detalhes completos
  const stripeSubscription: any = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Atualizar ou criar subscription no banco de dados
  await prisma.subscription.upsert({
    where: {
      stripeCustomerId: customerId
    },
    update: {
      stripeSubscriptionId: stripeSubscriptionId,
      status: 'active',
      currentPeriodStart: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(),
      planId: planId
    },
    create: {
      userId: userId,
      planId: planId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscriptionId,
      status: 'active',
      currentPeriodStart: stripeSubscription.current_period_start ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      currentPeriodEnd: stripeSubscription.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : new Date(),
      jobsCreatedThisMonth: 0
    }
  });

  console.log(`Subscription activated for user ${userId}`);
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
      currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000) : undefined,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined
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
      canceledAt: new Date()
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
  const lastReset = subscription.jobsCreatedAt;
  
  if (!lastReset || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    await prisma.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        jobsCreatedThisMonth: 0,
        jobsCreatedAt: now,
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
