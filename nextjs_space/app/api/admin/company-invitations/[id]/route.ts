import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(['pending', 'password_set', 'payment_pending', 'completed', 'expired']).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }

    const invitation = await db.companyInvitation.findUnique({
      where: { id: params.id },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error: any) {
    console.error('Erro ao buscar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convite' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    const invitation = await db.companyInvitation.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(invitation)
  } catch (error: any) {
    console.error('Erro ao atualizar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar convite' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }

    await db.companyInvitation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar convite:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar convite' },
      { status: 500 }
    )
  }
}
