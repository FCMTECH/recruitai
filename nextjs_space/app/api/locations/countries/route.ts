
import { NextResponse } from 'next/server';
import { countries } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar países' },
      { status: 500 }
    );
  }
}
