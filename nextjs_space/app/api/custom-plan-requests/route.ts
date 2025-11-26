import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  message: z.string().optional(),
});

// POST - Create new custom plan request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Create request in database
    const customPlanRequest = await db.customPlanRequest.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message || null,
        status: "pending",
      },
    });

    // Send emails in background (non-blocking)
    // This improves response time and user experience
    setImmediate(async () => {
      // Send email notification to comercial@fcmtech.com.br
      try {
        await sendEmail({
        to: "comercial@fcmtech.com.br",
        subject: "Nova Solicitação de Plano Personalizado - RecruitAI",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Nova Solicitação de Plano Personalizado</h2>
            <p>Uma nova solicitação foi recebida:</p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nome:</strong> ${validatedData.name}</p>
              <p><strong>E-mail:</strong> ${validatedData.email}</p>
              <p><strong>Telefone:</strong> ${validatedData.phone}</p>
              ${validatedData.message ? `<p><strong>Mensagem:</strong><br/>${validatedData.message}</p>` : ''}
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Você pode visualizar e gerenciar esta solicitação no painel administrativo.
            </p>
          </div>
        `,
        text: `
Nova Solicitação de Plano Personalizado

Nome: ${validatedData.name}
E-mail: ${validatedData.email}
Telefone: ${validatedData.phone}
${validatedData.message ? `Mensagem: ${validatedData.message}` : ''}
        `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
      // Continue mesmo se o e-mail falhar
    }

    // Send confirmation email to the requester
    try {
      await sendEmail({
        to: validatedData.email,
        subject: "Recebemos sua solicitação - RecruitAI",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Obrigado pelo seu interesse!</h2>
            <p>Olá ${validatedData.name},</p>
            
            <p>Recebemos sua solicitação de contato para o Plano Personalizado do RecruitAI.</p>
            
            <p>Nossa equipe comercial entrará em contato com você em breve para entender melhor suas necessidades e apresentar uma solução customizada.</p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Seus dados:</strong></p>
              <p style="margin: 10px 0 0 0;">E-mail: ${validatedData.email}</p>
              <p style="margin: 5px 0 0 0;">Telefone: ${validatedData.phone}</p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Atenciosamente,<br/>
              Equipe RecruitAI
            </p>
          </div>
        `,
        text: `
Olá ${validatedData.name},

Recebemos sua solicitação de contato para o Plano Personalizado do RecruitAI.

Nossa equipe comercial entrará em contato com você em breve.

Atenciosamente,
Equipe RecruitAI
        `,
      });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de confirmação:", emailError);
      }
    }); // End of setImmediate

    // Return success immediately without waiting for emails
    return NextResponse.json({
      success: true,
      message: "Solicitação enviada com sucesso! Entraremos em contato em breve.",
      requestId: customPlanRequest.id,
    });
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

// GET - List all custom plan requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status && status !== "all" ? { status } : {};

    const requests = await db.customPlanRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Count by status
    const stats = {
      total: await db.customPlanRequest.count(),
      pending: await db.customPlanRequest.count({ where: { status: "pending" } }),
      contacted: await db.customPlanRequest.count({ where: { status: "contacted" } }),
      converted: await db.customPlanRequest.count({ where: { status: "converted" } }),
      rejected: await db.customPlanRequest.count({ where: { status: "rejected" } }),
    };

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar solicitações" },
      { status: 500 }
    );
  }
}
