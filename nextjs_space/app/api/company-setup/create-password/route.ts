import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const passwordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = passwordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    const invitation = await db.companyInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    if (invitation.status === 'completed') {
      return NextResponse.json(
        { error: 'Este convite já foi utilizado' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Este convite expirou' },
        { status: 400 }
      )
    }

    // Verificar se já existe usuário com este e-mail
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar usuário
    const user = await db.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        name: invitation.tradeName || invitation.companyName,
        companyName: invitation.companyName,
        tradeName: invitation.tradeName,
        cnpj: invitation.cnpj,
        phone: invitation.phone,
        role: 'company',
        emailVerified: new Date(),
      },
    })

    // Atualizar status do convite
    await db.companyInvitation.update({
      where: { id: invitation.id },
      data: { status: 'password_set' },
    })

    return NextResponse.json({
      success: true,
      message: 'Senha criada com sucesso! Agora você pode prosseguir para o pagamento.',
      userId: user.id,
    })
  } catch (error: any) {
    console.error('Erro ao criar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao criar senha' },
      { status: 500 }
    )
  }
}
