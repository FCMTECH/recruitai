
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
    const { email, password, name, companyName, role, planId } = signupSchema.parse(body);

    // Validate company name for companies
    if (role === "company" && !companyName) {
      return NextResponse.json(
        { error: "Nome da empresa é obrigatório para empresas" },
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

    // Send verification email
    try {
      const token = await generateVerificationToken(user.email);
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: 'Verificação de Email - RecruitAI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bem-vindo ao RecruitAI!</h2>
            <p>Por favor, clique no link abaixo para verificar seu email:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verificar Email
            </a>
            <p>Este link expira em 24 horas.</p>
            <p>Se você não criou uma conta no RecruitAI, ignore este email.</p>
          </div>
        `,
        text: `Bem-vindo ao RecruitAI! Por favor, verifique seu email clicando neste link: ${verificationUrl}. Este link expira em 24 horas.`,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
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
