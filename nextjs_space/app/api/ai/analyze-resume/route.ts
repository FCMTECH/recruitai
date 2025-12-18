
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { applicationId, fileBuffer, fileName, job } = await request.json();

    // Prepare the analysis prompt
    const analysisPrompt = `
Você é um especialista em análise de currículos. Analise o currículo fornecido com base nos critérios específicos da vaga.

INFORMAÇÕES DA VAGA:
Título: ${job.title}
Descrição: ${job.description}
Requisitos: ${job.requirements || "Não especificado"}

CRITÉRIOS DE AVALIAÇÃO (com pesos):
${(job.criteria as any[]).map(c => 
  `- ${c.name} (${c.weight}%): ${c.description} ${c.required ? "(OBRIGATÓRIO)" : "(DESEJÁVEL)"}`
).join('\n')}

TAREFA:
1. Extraia todas as informações relevantes do currículo
2. Para cada critério, calcule um score de 0-100 baseado na compatibilidade
3. Calcule o score final ponderado (0-100)
4. Classifique o candidato:
   - "strong" (90-100%): Forte candidato
   - "potential" (70-89%): Potencial  
   - "review" (50-69%): Revisar
   - "incompatible" (<50%): Não compatível
5. Forneça explicação detalhada do score
6. Destaque experiências/habilidades mais relevantes

Por favor, responda em JSON com a seguinte estrutura:
{
  "extractedData": {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string"
    },
    "experience": [
      {
        "position": "string",
        "company": "string", 
        "duration": "string",
        "description": "string",
        "relevantSkills": ["skill1", "skill2"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string",
        "field": "string"
      }
    ],
    "skills": ["skill1", "skill2", "skill3"],
    "languages": [
      {
        "language": "string",
        "level": "string"
      }
    ]
  },
  "analysis": {
    "criteriaScores": {
      "${job.criteria[0]?.name || 'experience'}": {
        "score": 85,
        "explanation": "Explicação detalhada"
      }
    },
    "overallScore": 82,
    "classification": "potential",
    "explanation": "Explicação completa do score final",
    "highlights": [
      "5 anos de experiência em React",
      "Formação em Ciência da Computação",
      "Experiência com metodologias ágeis"
    ],
    "strengths": ["Pontos fortes"],
    "weaknesses": ["Pontos de atenção"],
    "recommendations": "Recomendações para a empresa"
  }
}

Responda com JSON limpo apenas. Não inclua blocos de código markdown.
`;

    // Convert file buffer from base64 and prepare for AI API
    const fileBufferBinary = Buffer.from(fileBuffer, 'base64');
    const base64String = fileBufferBinary.toString('base64');

    // Determine content type based on file extension
    let mimeType = 'application/pdf';
    if (fileName.toLowerCase().endsWith('.doc')) {
      mimeType = 'application/msword';
    } else if (fileName.toLowerCase().endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Call Abacus.AI API - Let Abacus decide the best model automatically
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        // Omit 'model' parameter to let Abacus.AI automatically select the best model
        // This enables intelligent routing to the optimal AI model for each task
        messages: [
          {
            role: "user",
            content: [
              {
                type: "file",
                file: {
                  filename: fileName,
                  file_data: `data:${mimeType};base64,${base64String}`
                }
              },
              {
                type: "text",
                text: analysisPrompt
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        stream: false
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis content received from AI");
    }

    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      throw new Error("Invalid JSON response from AI");
    }

    // Update application with analysis results
    const updatedApplication = await db.application.update({
      where: { id: applicationId },
      data: {
        aiAnalysis: analysisData,
        compatibilityScore: analysisData.analysis?.overallScore || 0,
        classification: analysisData.analysis?.classification || "review",
        scoreExplanation: analysisData.analysis?.explanation || "",
        highlights: analysisData.analysis?.highlights || [],
        criteriaScores: analysisData.analysis?.criteriaScores || {},
        status: "pending" // Keep as pending for company review
      }
    });

    return NextResponse.json({
      success: true,
      applicationId,
      analysis: analysisData
    });

  } catch (error) {
    console.error("AI analysis error:", error);

    // Update application with error status
    try {
      const { applicationId: appId } = await request.json();
      await db.application.update({
        where: { id: appId },
        data: {
          status: "error",
          aiAnalysis: {
            error: error instanceof Error ? error.message : "Erro na análise"
          }
        }
      });
    } catch (dbError) {
      console.error("Failed to update application with error:", dbError);
    }

    return NextResponse.json(
      { error: "Erro na análise do currículo" },
      { status: 500 }
    );
  }
}
