
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

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
        role: role
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Usuário criado com sucesso",
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
