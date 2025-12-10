
import { NextResponse } from 'next/server';
import { getCities } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const state = searchParams.get('state');

    if (!country || !state) {
      return NextResponse.json(
        { error: 'País e estado devem ser informados' },
        { status: 400 }
      );
    }

    const cities = getCities(country, state);
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cidades' },
      { status: 500 }
    );
  }
}
