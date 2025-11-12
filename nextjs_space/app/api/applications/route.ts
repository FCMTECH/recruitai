
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/s3";
import { z } from "zod";

const applicationSchema = z.object({
  candidateName: z.string().min(1, "Nome é obrigatório"),
  candidateEmail: z.string().email("Email inválido"),
  candidatePhone: z.string().optional(),
  jobId: z.string().min(1, "ID da vaga é obrigatório")
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const candidateName = formData.get("candidateName") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const candidatePhone = formData.get("candidatePhone") as string;
    const jobId = formData.get("jobId") as string;
    const file = formData.get("file") as File;

    // Validate form data
    const validatedData = applicationSchema.parse({
      candidateName,
      candidateEmail,
      candidatePhone,
      jobId
    });

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    // Validate job exists and is active
    const job = await db.job.findFirst({
      where: { 
        id: jobId,
        status: "active"
      },
      include: {
        criteria: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Vaga não encontrada ou inativa" },
        { status: 404 }
      );
    }

    // Upload file to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeUrl = await uploadFile(buffer, file.name);

    // Create application record
    const application = await db.application.create({
      data: {
        jobId,
        candidateName: validatedData.candidateName,
        candidateEmail: validatedData.candidateEmail,
        candidatePhone: validatedData.candidatePhone,
        resumeUrl,
        resumeFilename: file.name,
        status: "pending"
      }
    });

    // Start AI analysis in background
    processResumeAnalysis(application.id, buffer, file.name, job);

    return NextResponse.json({
      id: application.id,
      message: "Candidatura enviada com sucesso"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Applications POST error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Background processing function
async function processResumeAnalysis(applicationId: string, fileBuffer: Buffer, fileName: string, job: any) {
  try {
    // Call AI analysis API
    const analysisResponse = await fetch(process.env.NEXTAUTH_URL + "/api/ai/analyze-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId,
        fileBuffer: fileBuffer.toString('base64'),
        fileName,
        job
      })
    });

    if (!analysisResponse.ok) {
      console.error("AI analysis failed:", await analysisResponse.text());
      
      // Update application with error status
      await db.application.update({
        where: { id: applicationId },
        data: {
          status: "error",
          aiAnalysis: {
            error: "Falha na análise automática"
          }
        }
      });
    }

  } catch (error) {
    console.error("Background analysis error:", error);
    
    // Update application with error status
    try {
      await db.application.update({
        where: { id: applicationId },
        data: {
          status: "error",
          aiAnalysis: {
            error: "Erro no processamento"
          }
        }
      });
    } catch (dbError) {
      console.error("Failed to update application status:", dbError);
    }
  }
}
