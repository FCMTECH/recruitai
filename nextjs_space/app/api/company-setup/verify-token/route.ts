import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
        { valid: false, error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já foi completado
    if (invitation.status === 'completed') {
      return NextResponse.json({
        valid: false,
        error: 'Este convite já foi utilizado',
      })
    }

    // Verificar se expirou
    if (new Date() > invitation.expiresAt) {
      await db.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })

      return NextResponse.json({
        valid: false,
        error: 'Este convite expirou',
      })
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        companyName: invitation.companyName,
        tradeName: invitation.tradeName,
        cnpj: invitation.cnpj,
        phone: invitation.phone,
        customPlanName: invitation.customPlanName,
        customJobLimit: invitation.customJobLimit,
        customPrice: invitation.customPrice,
        customFeatures: invitation.customFeatures,
        status: invitation.status,
      },
    })
  } catch (error: any) {
    console.error('Erro ao verificar token:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar token' },
      { status: 500 }
    )
  }
}
