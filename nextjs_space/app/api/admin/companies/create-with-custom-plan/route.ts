import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const createCompanySchema = z.object({
  email: z.string().email('E-mail inválido'),
  companyName: z.string().min(3, 'Razão Social deve ter pelo menos 3 caracteres'),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  customJobLimit: z.number().min(1, 'Mínimo de 1 vaga').max(10000, 'Máximo de 10000 vagas'),
  customPrice: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  customFeatures: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = createCompanySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verificar se já existe usuário com este e-mail
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail' },
        { status: 400 }
      )
    }

    // Verificar se já existe convite pendente para este e-mail
    const existingInvitation = await db.companyInvitation.findFirst({
      where: {
        email: data.email,
        status: {
          in: ['pending', 'password_set', 'payment_pending'],
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Já existe um convite pendente para este e-mail' },
        { status: 400 }
      )
    }

    // Gerar token único
    const token = randomBytes(32).toString('hex')

    // Data de expiração: 7 dias
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Features padrão do plano personalizado
    const defaultFeatures = [
      'Vagas customizadas',
      'Membros ilimitados',
      'Grupos ilimitados',
      'Suporte prioritário',
      'Análise de IA ilimitada',
      'Dashboard avançado',
      'Relatórios personalizados',
      'Integrações avançadas',
    ]

    // Criar convite
    const invitation = await db.companyInvitation.create({
      data: {
        email: data.email,
        companyName: data.companyName,
        tradeName: data.tradeName,
        cnpj: data.cnpj,
        phone: data.phone,
        token,
        customJobLimit: data.customJobLimit,
        customPrice: data.customPrice,
        customFeatures: data.customFeatures || defaultFeatures,
        status: 'pending',
        expiresAt,
        createdBy: session.user.id,
        notes: data.notes,
      },
    })

    // Enviar e-mail para a empresa
    const setupUrl = `${process.env.NEXTAUTH_URL}/company-setup/${token}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .feature { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .feature:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo à RecruitAI! 🎉</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.companyName}</strong>,</p>
            <p>Temos o prazer de informá-lo que sua empresa foi convidada a utilizar a plataforma RecruitAI com um <strong>Plano Personalizado</strong> exclusivo!</p>
            
            <div class="plan-details">
              <h3 style="margin-top: 0; color: #667eea;">💼 Detalhes do Seu Plano Personalizado</h3>
              <p><strong>Quantitativo de Vagas:</strong> ${data.customJobLimit} vagas/mês</p>
              <p><strong>Valor Mensal:</strong> R$ ${data.customPrice.toFixed(2)}</p>
              <h4 style="margin-bottom: 10px;">✨ Recursos Incluídos:</h4>
              ${(data.customFeatures || defaultFeatures).map((feature: any) => 
                `<div class="feature">✅ ${feature}</div>`
              ).join('')}
            </div>

            <h3>🚀 Próximos Passos</h3>
            <ol>
              <li><strong>Criar sua senha:</strong> Acesse o link abaixo e defina uma senha segura</li>
              <li><strong>Realizar pagamento:</strong> Escolha sua forma de pagamento (Cartão ou Boleto)</li>
              <li><strong>Acesso imediato:</strong> Após confirmação, seu acesso será liberado automaticamente</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" class="button">
                🔑 Configurar Minha Conta
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;"><strong>Importante:</strong> Este link é válido por 7 dias. Após este período, será necessário solicitar um novo convite.</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <h4>📞 Precisa de Ajuda?</h4>
            <p>Nossa equipe de suporte está à disposição para ajudá-lo:</p>
            <ul>
              <li>📧 E-mail: <a href="mailto:comercial@fcmtech.com.br">comercial@fcmtech.com.br</a></li>
              <li>💬 WhatsApp: (91) 99999-9999</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 RecruitAI - Plataforma de Recrutamento Inteligente</p>
            <p>Este é um e-mail automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Enviar e-mail em background (não bloqueia a resposta)
    setImmediate(async () => {
      try {
        await sendEmail({
          to: data.email,
          subject: '🎉 Bem-vindo à RecruitAI - Configure sua Conta',
          html: emailHtml,
          text: `Bem-vindo à RecruitAI!\n\nSua empresa ${data.companyName} foi convidada a utilizar nossa plataforma com um Plano Personalizado.\n\nVagas: ${data.customJobLimit}/mês\nValor: R$ ${data.customPrice.toFixed(2)}\n\nPara configurar sua conta, acesse: ${setupUrl}\n\nEste link é válido por 7 dias.`,
        })
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Empresa criada com sucesso! E-mail de convite enviado.',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        companyName: invitation.companyName,
        setupUrl,
        expiresAt: invitation.expiresAt,
      },
    })
  } catch (error: any) {
    console.error('Erro ao criar empresa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar empresa' },
      { status: 500 }
    )
  }
}
