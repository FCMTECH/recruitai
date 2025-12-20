
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateVerificationToken } from "@/lib/verification";
import { sendEmail } from "@/lib/email";

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  planId: z.string().optional(),
  role: z.any().transform((val) => {
    // If role is not provided or invalid, default to 'candidate'
    if (val === "candidate" || val === "company") {
      return val;
    }
    return "candidate";
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, cnpj, phone, address, city, state, role, planId } = signupSchema.parse(body);

    // Validate company name for companies
    if (role === "company" && !companyName) {
      return NextResponse.json(
        { error: "Razão Social é obrigatória para empresas" },
        { status: 400 }
      );
    }

    // Validate CNPJ for companies
    if (role === "company" && !cnpj) {
      return NextResponse.json(
        { error: "CNPJ é obrigatório para empresas" },
        { status: 400 }
      );
    }

    // Validate phone for companies
    if (role === "company" && !phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório para empresas" },
        { status: 400 }
      );
    }

    // Validate plan selection for companies
    if (role === "company" && !planId) {
      return NextResponse.json(
        { error: "Por favor, selecione um plano para continuar" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já existe com este email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with appropriate role
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyName: role === "company" ? companyName : "",
        cnpj: role === "company" && cnpj ? cnpj : null,
        phone: role === "company" && phone ? phone : null,
        address: role === "company" && address ? address : null,
        city: role === "company" && city ? city : null,
        state: role === "company" && state ? state : null,
        role: role,
        emailVerified: new Date() // Auto-verify email on signup
      }
    });

    // If candidate, create profile
    if (role === "candidate") {
      await db.candidateProfile.create({
        data: {
          email: user.email,
          fullName: user.name || "",
        }
      });
    }

    // If company, create subscription with selected plan
    if (role === "company" && planId) {
      const plan = await db.plan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        return NextResponse.json(
          { error: "Plano selecionado não encontrado" },
          { status: 400 }
        );
      }

      const now = new Date();
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial

      await db.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: "trial",
          startDate: now,
          endDate: trialEndDate,
          trialEndDate: trialEndDate,
          jobsCreatedThisMonth: 0,
          lastResetDate: now,
        }
      });
    }

    // Send welcome email
    try {
      // Get base URL from request headers
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
      
      const dashboardUrl = role === 'company' 
        ? `${baseUrl}/dashboard`
        : `${baseUrl}/candidate/dashboard`;

      if (role === 'company') {
        await sendEmail({
          to: user.email,
          subject: 'Bem-vindo ao RecruitAI - Conta Empresa Criada',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3B82F6; text-align: center;">🎉 Bem-vindo ao RecruitAI!</h2>
              <p>Olá <strong>${name || companyName}</strong>,</p>
              <p>Sua conta foi criada com sucesso! Estamos felizes em tê-lo conosco.</p>
              
              <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1F2937;">📋 Próximos Passos:</h3>
                <ol style="color: #4B5563; line-height: 1.8;">
                  <li>Complete seu perfil com informações da empresa</li>
                  <li>Crie sua primeira vaga</li>
                  <li>Convide membros da equipe</li>
                  <li>Explore os recursos disponíveis</li>
                </ol>
              </div>

              <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1E3A8A;"><strong>✨ Período de teste:</strong> Você tem 7 dias grátis para testar todas as funcionalidades!</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Acessar Dashboard
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
              
              <p style="color: #6B7280; font-size: 14px;">
                <strong>Precisa de ajuda?</strong><br>
                Nossa equipe de suporte está sempre disponível. Acesse a seção de <strong>Suporte</strong> no seu dashboard.
              </p>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
                Obrigado por escolher RecruitAI!<br>
                Equipe RecruitAI
              </p>
            </div>
          `,
          text: `Bem-vindo ao RecruitAI, ${name || companyName}! Sua conta foi criada com sucesso. Acesse: ${dashboardUrl}`
        });
      } else {
        // E-mail para candidatos
        await sendEmail({
          to: user.email,
          subject: 'Bem-vindo ao RecruitAI - Conta Criada',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #3B82F6; text-align: center;">🎉 Bem-vindo ao RecruitAI!</h2>
              <p>Olá <strong>${name}</strong>,</p>
              <p>Sua conta foi criada com sucesso!</p>
              
              <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1F2937;">📋 Próximos Passos:</h3>
                <ol style="color: #4B5563; line-height: 1.8;">
                  <li>Complete seu perfil profissional</li>
                  <li>Faça upload do seu currículo</li>
                  <li>Explore as vagas disponíveis</li>
                  <li>Candidate-se às vagas de seu interesse</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Acessar Meu Perfil
                </a>
              </div>

              <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
                Obrigado por escolher RecruitAI!<br>
                Equipe RecruitAI
              </p>
            </div>
          `,
          text: `Bem-vindo ao RecruitAI, ${name}! Sua conta foi criada com sucesso. Acesse: ${dashboardUrl}`
        });
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue even if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Usuário criado com sucesso! Verifique seu email para ativar sua conta.",
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
