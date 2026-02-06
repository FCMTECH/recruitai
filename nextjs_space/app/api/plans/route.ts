
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar apenas planos públicos (não personalizados)
    // Planos personalizados (isCustom: true) são específicos para empresas
    const plans = await db.plan.findMany({
      where: {
        isActive: true,
        isCustom: { not: true }
      },
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}
