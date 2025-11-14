
/**
 * Email utilities for RecruitAI
 * Using nodemailer for SMTP or can be easily replaced with Resend/SendGrid
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  try {
    // For now, just log emails to console
    // In production, integrate with SMTP, Resend, or SendGrid
    console.log('📧 EMAIL ENVIADO:');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('Conteúdo (HTML):', html);
    
    // Simulate email sending
    return {
      success: true,
      messageId: `mock-${Date.now()}`
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

// Email templates
export const emailTemplates = {
  applicationReceived: (candidateName: string, jobTitle: string, companyName: string) => ({
    subject: `Candidatura Recebida - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #0ea5e9; margin-bottom: 24px; font-size: 24px;">
            ✅ Candidatura Recebida!
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Olá, <strong>${candidateName}</strong>!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Sua candidatura para a vaga de <strong>${jobTitle}</strong> na empresa <strong>${companyName}</strong> foi recebida com sucesso!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Nosso sistema de IA está analisando seu perfil e você será notificado sobre atualizações no processo seletivo.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              Boa sorte! 🍀<br>
              <strong>Equipe RecruitAI</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Olá, ${candidateName}!\n\nSua candidatura para a vaga de ${jobTitle} na empresa ${companyName} foi recebida com sucesso!\n\nBoa sorte!\nEquipe RecruitAI`
  }),

  applicationStatusUpdate: (candidateName: string, jobTitle: string, newStage: string, companyName: string) => ({
    subject: `Atualização de Candidatura - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #0ea5e9; margin-bottom: 24px; font-size: 24px;">
            📢 Atualização na sua Candidatura
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Olá, <strong>${candidateName}</strong>!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Há uma novidade sobre sua candidatura para <strong>${jobTitle}</strong> na <strong>${companyName}</strong>.
          </p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #0f172a; font-size: 16px; margin: 0;">
              <strong>Nova etapa:</strong> ${newStage}
            </p>
          </div>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Acesse a plataforma para mais detalhes sobre o processo seletivo.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              Boa sorte! 🎯<br>
              <strong>Equipe RecruitAI</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Olá, ${candidateName}!\n\nHá uma atualização sobre sua candidatura para ${jobTitle} na ${companyName}.\n\nNova etapa: ${newStage}\n\nBoa sorte!\nEquipe RecruitAI`
  }),

  newApplication: (companyName: string, jobTitle: string, candidateName: string) => ({
    subject: `Nova Candidatura Recebida - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #10b981; margin-bottom: 24px; font-size: 24px;">
            🎉 Nova Candidatura!
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Olá, <strong>${companyName}</strong>!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Você recebeu uma nova candidatura de <strong>${candidateName}</strong> para a vaga de <strong>${jobTitle}</strong>.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Acesse o dashboard para analisar o perfil do candidato e os scores de compatibilidade gerados pela IA.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              <strong>Equipe RecruitAI</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Olá, ${companyName}!\n\nVocê recebeu uma nova candidatura de ${candidateName} para a vaga de ${jobTitle}.\n\nEquipe RecruitAI`
  }),

  trialExpiring: (companyName: string, daysLeft: number) => ({
    subject: `Seu período de teste expira em ${daysLeft} dias`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #f59e0b; margin-bottom: 24px; font-size: 24px;">
            ⏰ Seu teste está acabando!
          </h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Olá, <strong>${companyName}</strong>!
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Seu período de teste gratuito de 7 dias expira em <strong>${daysLeft} dias</strong>.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Para continuar aproveitando todos os recursos da RecruitAI, escolha um plano que atenda suas necessidades.
          </p>
          <div style="margin: 24px 0;">
            <a href="https://seu-dominio.com/pricing" style="display: inline-block; background: linear-gradient(to right, #0ea5e9, #06b6d4); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Ver Planos e Preços
            </a>
          </div>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              <strong>Equipe RecruitAI</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Olá, ${companyName}!\n\nSeu período de teste gratuito expira em ${daysLeft} dias.\n\nAcesse nossa plataforma para escolher um plano.\n\nEquipe RecruitAI`
  })
};
