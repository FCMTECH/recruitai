
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get("zipCode");
    const country = searchParams.get("country") || "Brasil";

    if (!zipCode) {
      return NextResponse.json(
        { error: "CEP é obrigatório" },
        { status: 400 }
      );
    }

    // Para Brasil, usar ViaCEP
    if (country === "Brasil" || country === "Brazil") {
      const cleanZip = zipCode.replace(/\D/g, ""); // Remove caracteres não numéricos

      if (cleanZip.length !== 8) {
        return NextResponse.json(
          { error: "CEP inválido. Digite um CEP com 8 dígitos" },
          { status: 400 }
        );
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      
      if (!response.ok) {
        return NextResponse.json(
          { error: "Erro ao buscar CEP" },
          { status: 500 }
        );
      }

      const data = await response.json();

      if (data.erro) {
        return NextResponse.json(
          { error: "CEP não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        city: data.localidade,
        state: data.uf,
        country: "Brasil",
        street: data.logradouro || "",      // Logradouro/Rua
        neighborhood: data.bairro || "",     // Bairro
        complement: data.complemento || "",  // Complemento
      });
    }

    // Para outros países, retornar mensagem informativa
    return NextResponse.json({
      error: "Busca automática de endereço disponível apenas para CEPs brasileiros no momento"
    }, { status: 400 });

  } catch (error) {
    console.error("Error fetching ZIP code:", error);
    return NextResponse.json(
      { error: "Erro ao buscar CEP" },
      { status: 500 }
    );
  }
}
