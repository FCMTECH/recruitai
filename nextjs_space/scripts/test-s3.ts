import { config } from 'dotenv';
import { createS3Client, getBucketConfig } from '../lib/aws-config';
import { uploadFile, downloadFile } from '../lib/s3';

// Carrega variáveis de ambiente
config();

// Remove AWS_PROFILE para evitar conflitos com credenciais explícitas
delete process.env.AWS_PROFILE;

async function testS3Connection() {
  console.log('🔧 Testando conexão com AWS S3...\n');

  // 1. Verificar variáveis de ambiente
  console.log('📋 Variáveis de Ambiente:');
  console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Configurado' : '❌ Não configurado');
  console.log('  AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ Não configurado');
  console.log('  AWS_S3_REGION:', process.env.AWS_S3_REGION || 'us-east-2 (padrão)');
  console.log('  AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'Não configurado');
  console.log('  AWS_S3_FOLDER_PREFIX:', process.env.AWS_S3_FOLDER_PREFIX || 'Não configurado');
  console.log();

  // 2. Testar criação do cliente S3
  try {
    console.log('🔌 Criando cliente S3...');
    const s3Client = createS3Client();
    console.log('✅ Cliente S3 criado com sucesso!\n');
  } catch (error) {
    console.error('❌ Erro ao criar cliente S3:', error);
    return;
  }

  // 3. Testar configuração do bucket
  const bucketConfig = getBucketConfig();
  console.log('🪣 Configuração do Bucket:');
  console.log('  Bucket Name:', bucketConfig.bucketName);
  console.log('  Folder Prefix:', bucketConfig.folderPrefix);
  console.log();

  // 4. Testar upload de arquivo
  try {
    console.log('📤 Testando upload de arquivo...');
    const testContent = Buffer.from('Este é um arquivo de teste do RecruitAI!', 'utf-8');
    const testFileName = `test-${Date.now()}.txt`;
    
    const uploadedKey = await uploadFile(testContent, testFileName);
    console.log('✅ Upload realizado com sucesso!');
    console.log('  S3 Key:', uploadedKey);
    console.log();

    // 5. Testar download de arquivo
    console.log('📥 Testando download de arquivo...');
    const downloadUrl = await downloadFile(uploadedKey);
    console.log('✅ URL de download gerada com sucesso!');
    console.log('  Download URL:', downloadUrl.substring(0, 100) + '...');
    console.log();

    console.log('🎉 Todos os testes foram bem-sucedidos!');
    console.log('\n✅ Seu AWS S3 está configurado corretamente!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Fazer deploy no Vercel');
    console.log('  2. Adicionar as variáveis de ambiente no Vercel');
    console.log('  3. Testar upload de currículos em produção');

  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('\n🔍 Possíveis causas:');
    console.error('  1. Credenciais AWS incorretas');
    console.error('  2. Bucket não existe ou está em região diferente');
    console.error('  3. Usuário IAM sem permissões adequadas');
    console.error('  4. Configuração CORS incorreta');
    console.error('\n📖 Revise as configurações no AWS Console');
  }
}

testS3Connection();
