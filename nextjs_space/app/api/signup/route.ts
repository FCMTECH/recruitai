
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
  companyName: z.string().optional(),
  role: z.enum(["candidate", "company"]).default("candidate"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, role } = signupSchema.parse(body);

    // Validate company name for companies
    if (role === "company" && !companyName) {
      return NextResponse.json(
        { error: "Nome da empresa é obrigatório para empresas" },
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
