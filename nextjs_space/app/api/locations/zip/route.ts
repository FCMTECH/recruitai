
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Buscar endereço por CEP/ZIP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');
    const country = searchParams.get('country') || 'Brasil';

    if (!zipCode) {
      return NextResponse.json(
        { error: 'CEP/ZIP é obrigatório' },
        { status: 400 }
      );
    }

    // Remove caracteres não numéricos
    const cleanZip = zipCode.replace(/\D/g, '');

    // Para o Brasil, usa o ViaCEP
    if (country === 'Brasil' || country === 'Brazil') {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
        
        if (!response.ok) {
          return NextResponse.json(
            { error: 'CEP não encontrado' },
            { status: 404 }
          );
        }

        const data = await response.json();

        if (data.erro) {
          return NextResponse.json(
            { error: 'CEP não encontrado' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          city: data.localidade,
          state: data.uf,
          country: 'Brasil',
          address: `${data.logradouro}${data.complemento ? ', ' + data.complemento : ''}`,
          neighborhood: data.bairro,
        });
      } catch (error) {
        console.error('Erro ao buscar CEP no ViaCEP:', error);
        return NextResponse.json(
          { error: 'Erro ao buscar CEP' },
          { status: 500 }
        );
      }
    }

    // Para outros países, retorna erro (pode ser expandido no futuro)
    return NextResponse.json(
      { 
        error: 'Busca automática de endereço disponível apenas para CEPs brasileiros no momento',
        success: false 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar endereço' },
      { status: 500 }
    );
  }
}
