require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('🧪 Testando configuração do Zoho Mail...\n');
    
    console.log('Configurações:');
    console.log('- Host:', process.env.SMTP_HOST);
    console.log('- Port:', process.env.SMTP_PORT);
    console.log('- User:', process.env.SMTP_USER);
    console.log('- Pass:', process.env.SMTP_PASS ? '********' : 'NÃO CONFIGURADO');
    console.log('- From Name:', process.env.SMTP_FROM_NAME);
    console.log('');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('📤 Enviando email de teste...\n');
    
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Enviando para o próprio email
      subject: '✅ Teste de Configuração - RecruitAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #0ea5e9, #06b6d4); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Configuração Bem-Sucedida!</h1>
          </div>
          <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              <strong>Parabéns!</strong> O sistema de email da RecruitAI está configurado e funcionando perfeitamente com o Zoho Mail.
            </p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; color: #0f172a; font-size: 14px;">
                <strong>📧 Servidor:</strong> ${process.env.SMTP_HOST}<br>
                <strong>👤 Usuário:</strong> ${process.env.SMTP_USER}<br>
                <strong>🕐 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}<br>
              </p>
            </div>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              A partir de agora, a plataforma enviará automaticamente:
            </p>
            <ul style="color: #475569; font-size: 16px; line-height: 1.8;">
              <li>✅ Confirmações de candidatura</li>
              <li>📢 Atualizações de status</li>
              <li>📅 Convites para entrevistas</li>
              <li>🎯 Notificações para empresas</li>
              <li>🔐 Verificações de email</li>
            </ul>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                <strong style="color: #0ea5e9;">RecruitAI</strong><br>
                Plataforma de Recrutamento Inteligente
              </p>
            </div>
          </div>
        </div>
      `,
      text: 'Configuração do Zoho Mail funcionando! Email de teste enviado com sucesso.'
    });
    
    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📬 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('\n🎉 O sistema de email está 100% operacional!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Verifique sua caixa de entrada: ' + process.env.SMTP_USER);
    console.log('   2. O sistema já pode enviar emails automaticamente');
    console.log('   3. Teste criando uma candidatura ou fazendo cadastro');
    
  } catch (error) {
    console.error('\n❌ ERRO ao enviar email:');
    console.error(error.message);
    console.error('\n🔍 Detalhes do erro:');
    console.error(error);
    process.exit(1);
  }
}

testEmail();
