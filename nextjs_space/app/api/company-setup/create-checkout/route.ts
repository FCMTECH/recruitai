import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    const invitation = await db.companyInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'password_set') {
      return NextResponse.json(
        { error: 'Você precisa criar sua senha primeiro' },
        { status: 400 }
      )
    }

    // Buscar usuário criado
    const user = await db.user.findUnique({
      where: { email: invitation.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar ou recuperar cliente Stripe
    let stripeCustomerId = invitation.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: invitation.email,
        name: invitation.companyName,
        metadata: {
          userId: user.id,
          invitationId: invitation.id,
          customPlan: 'true',
        },
      })
      stripeCustomerId = customer.id

      await db.companyInvitation.update({
        where: { id: invitation.id },
        data: { stripeCustomerId },
      })
    }

    // Criar sessão de checkout Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card', 'boleto'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: invitation.customPlanName,
              description: `Plano personalizado com ${invitation.customJobLimit} vagas/mês`,
            },
            unit_amount: Math.round(invitation.customPrice * 100), // Converter para centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/company-setup/${token}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/company-setup/${token}?canceled=true`,
      metadata: {
        userId: user.id,
        invitationId: invitation.id,
        customPlan: 'true',
        customJobLimit: invitation.customJobLimit.toString(),
      },
    })

    // Salvar URL do checkout e atualizar status
    await db.companyInvitation.update({
      where: { id: invitation.id },
      data: {
        stripeCheckoutUrl: checkoutSession.url,
        status: 'payment_pending',
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    })
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}
