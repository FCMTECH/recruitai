
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/verification';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      `<html><body><h1>Token inválido</h1><p>O link de verificação é inválido.</p></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const result = await verifyToken(token);

  if (result.success) {
    return new NextResponse(
      `<html><body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #10b981;">✓ Email Verificado!</h1>
        <p>${result.message}</p>
        <p>Você pode agora <a href="/auth/signin" style="color: #2563eb;">fazer login</a>.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } else {
    return new NextResponse(
      `<html><body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #ef4444;">✗ Erro</h1>
        <p>${result.message}</p>
        <p><a href="/auth/signin" style="color: #2563eb;">Voltar para login</a></p>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
