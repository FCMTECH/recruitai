import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import type { CompanyInvitation } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const invitations = await db.companyInvitation.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Buscar dados do admin que criou cada convite
    const invitationsWithAdmin = await Promise.all(
      invitations.map(async (inv: CompanyInvitation) => {
        let createdByName = 'Desconhecido'
        if (inv.createdBy) {
          const admin = await db.user.findUnique({
            where: { id: inv.createdBy },
            select: { name: true, email: true },
          })
          createdByName = admin?.name || admin?.email || 'Desconhecido'
        }
        return {
          ...inv,
          createdByName,
        }
      })
    )

    return NextResponse.json(invitationsWithAdmin)
  } catch (error: any) {
    console.error('Erro ao buscar convites:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convites' },
      { status: 500 }
    )
  }
}
