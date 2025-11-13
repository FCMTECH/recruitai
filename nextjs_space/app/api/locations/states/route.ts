
import { NextResponse } from 'next/server';
import { getStates } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
      return NextResponse.json(
        { error: 'País não informado' },
        { status: 400 }
      );
    }

    const states = getStates(country);
    return NextResponse.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estados' },
      { status: 500 }
    );
  }
}
