
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create superadmin user (Platform Administrator)
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@atsplatform.com' },
    update: {
      emailVerified: new Date()
    },
    create: {
      email: 'admin@atsplatform.com',
      password: hashedPasswordAdmin,
      name: 'Administrador da Plataforma',
      companyName: 'RecruitAI',
      role: 'superadmin',
      emailVerified: new Date()
    }
  });

  console.log('🔑 Created superadmin user:', superAdmin.email);

  // Create test company user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {
      emailVerified: new Date()
    },
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'João Silva',
      companyName: 'TechCorp Solutions',
      role: 'company',
      emailVerified: new Date()
    }
  });

  console.log('👤 Created test company user:', testUser.email);

  // Create additional test company user
  const hashedPassword2 = await bcrypt.hash('empresa123', 12);
  
  const testCompany = await prisma.user.upsert({
    where: { email: 'empresa@teste.com' },
    update: {
      emailVerified: new Date()
    },
    create: {
      email: 'empresa@teste.com',
      password: hashedPassword2,
      name: 'Maria Oliveira',
      companyName: 'Startup Inovadora',
      role: 'company',
      emailVerified: new Date()
    }
  });

  console.log('👤 Created additional test company user:', testCompany.email);

  // Create plans
  const plans = [
    {
      name: 'free',
      displayName: 'Teste Grátis',
      price: 0,
      jobLimit: 5, // 5 vagas durante 1 semana
      memberLimit: 1, // Apenas o usuário principal
      features: [
        'Até 5 vagas durante 1 semana',
        'Apenas 1 usuário (sem membros adicionais)',
        'Análise completa de currículos com IA',
        'Dashboard avançado de candidatos',
        'Filtros e busca avançada',
        'Publicação automática em job boards',
        'Relatórios e estatísticas avançadas',
        'API de integração',
        'Suporte dedicado 24/7',
        '⭐ TODOS os recursos do Plano Ouro por 7 dias!'
      ]
    },
    {
      name: 'bronze',
      displayName: 'Bronze',
      price: 300,
      jobLimit: 25,
      memberLimit: 4, // Até 4 membros da equipe
      features: [
        'Até 25 vagas por mês',
        'Até 4 membros da equipe',
        'Grupos ilimitados',
        'Sistema de permissões',
        'Análise completa de currículos com IA',
        'Dashboard avançado de candidatos',
        'Filtros e busca avançada',
        'Suporte prioritário'
      ]
    },
    {
      name: 'prata',
      displayName: 'Prata',
      price: 500,
      jobLimit: 50,
      memberLimit: 15, // Até 15 membros da equipe
      features: [
        'Até 50 vagas por mês',
        'Até 15 membros da equipe',
        'Grupos ilimitados',
        'Sistema de permissões avançado',
        'Análise completa de currículos com IA',
        'Dashboard avançado de candidatos',
        'Filtros e busca avançada',
        'Publicação automática em job boards',
        'Relatórios e estatísticas',
        'Suporte prioritário'
      ]
    },
    {
      name: 'ouro',
      displayName: 'Ouro',
      price: 800,
      jobLimit: 100,
      memberLimit: 30, // Até 30 membros da equipe
      features: [
        'Até 100 vagas por mês',
        'Até 30 membros da equipe',
        'Grupos ilimitados',
        'Sistema de permissões completo',
        'Análise completa de currículos com IA',
        'Dashboard avançado de candidatos',
        'Filtros e busca avançada',
        'Publicação automática em job boards',
        'Relatórios e estatísticas avançadas',
        'API de integração',
        'Suporte dedicado 24/7'
      ]
    },
    {
      name: 'personalizado',
      displayName: 'Personalizado',
      price: 0, // Preço personalizado
      jobLimit: 999,
      memberLimit: 999, // Ilimitado
      features: [
        'Vagas ilimitadas',
        'Membros ilimitados',
        'Grupos ilimitados',
        'Permissões customizadas',
        'Todos os recursos dos planos anteriores',
        'Personalização completa',
        'Integrações customizadas',
        'Gerente de conta dedicado',
        'SLA garantido'
      ]
    }
  ];

  console.log('📋 Creating plans...');
  
  const createdPlans = [];
  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData
    });
    createdPlans.push(plan);
    console.log(`📦 Created plan: ${plan.displayName}`);
  }

  // Create trial subscription for test user
  const freePlan = createdPlans.find(p => p.name === 'free');
  if (freePlan) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 1 semana de teste

    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        planId: freePlan.id,
        status: 'trial',
        trialEndDate: trialEndDate,
        startDate: new Date(),
        endDate: trialEndDate,
        jobsCreatedThisMonth: 0
      }
    });

    console.log(`🎟️ Created trial subscription for ${testUser.email}`);
  }

  // Create sample jobs
  const sampleJobs = [
    {
      title: 'Desenvolvedor Full Stack Sênior',
      description: 'Estamos procurando um desenvolvedor full stack experiente para liderar projetos de desenvolvimento web. A posição envolve trabalho com React, Node.js, PostgreSQL e AWS. Oferecemos ambiente inovador, flexibilidade de horários e oportunidades de crescimento profissional.',
      requirements: 'Experiência mínima de 5 anos em desenvolvimento web, conhecimento em React, Node.js, bancos de dados relacionais, metodologias ágeis e inglês intermediário.',
      location: 'São Paulo, SP',
      type: 'full-time',
      status: 'active',
      criteria: [
        {
          criterion: 'Experiência em Desenvolvimento',
          description: 'Anos de experiência em desenvolvimento de software e complexidade dos projetos realizados',
          weight: 35
        },
        {
          criterion: 'Tecnologias Frontend',
          description: 'Conhecimento em React, JavaScript/TypeScript, HTML5, CSS3 e ferramentas modernas de desenvolvimento',
          weight: 25
        },
        {
          criterion: 'Tecnologias Backend',
          description: 'Experiência com Node.js, APIs REST, bancos de dados e arquitetura de sistemas',
          weight: 20
        },
        {
          criterion: 'Formação Acadêmica',
          description: 'Graduação em área relacionada à tecnologia (Ciência da Computação, Engenharia, etc.)',
          weight: 10
        },
        {
          criterion: 'Inglês',
          description: 'Nível de fluência em inglês para comunicação técnica e documentação',
          weight: 10
        }
      ]
    },
    {
      title: 'Designer UX/UI Pleno',
      description: 'Buscamos um designer UX/UI criativo e estratégico para criar interfaces excepcionais. Você trabalhará em projetos variados, desde aplicativos móveis até plataformas web complexas, sempre focando na experiência do usuário.',
      requirements: 'Experiência de 3+ anos em design digital, proficiência em Figma, Adobe Creative Suite, conhecimento em design thinking e prototipagem.',
      location: 'Remoto',
      type: 'full-time', 
      status: 'active',
      criteria: [
        {
          criterion: 'Portfólio e Experiência',
          description: 'Qualidade do portfólio, diversidade de projetos e anos de experiência em UX/UI',
          weight: 40
        },
        {
          criterion: 'Ferramentas de Design',
          description: 'Domínio de Figma, Adobe Creative Suite, Sketch e outras ferramentas de design',
          weight: 25
        },
        {
          criterion: 'UX Research e Estratégia',
          description: 'Conhecimento em pesquisa de usuário, design thinking, arquitetura de informação e usabilidade',
          weight: 20
        },
        {
          criterion: 'Comunicação e Colaboração',
          description: 'Habilidades de apresentação, trabalho em equipe e colaboração com desenvolvedores',
          weight: 15
        }
      ]
    }
  ];

  for (const jobData of sampleJobs) {
    const { criteria, ...jobInfo } = jobData;
    
    const job = await prisma.job.create({
      data: {
        ...jobInfo,
        userId: testUser.id,
        criteria: {
          create: criteria
        }
      },
      include: {
        criteria: true
      }
    });

    console.log(`💼 Created job: ${job.title}`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
