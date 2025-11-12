
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test company user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'João Silva',
      companyName: 'TechCorp Solutions',
      role: 'admin'
    }
  });

  console.log('👤 Created test user:', testUser.email);

  // Create additional test company user
  const hashedPassword2 = await bcrypt.hash('empresa123', 12);
  
  const testCompany = await prisma.user.upsert({
    where: { email: 'empresa@teste.com' },
    update: {},
    create: {
      email: 'empresa@teste.com',
      password: hashedPassword2,
      name: 'Maria Oliveira',
      companyName: 'Startup Inovadora',
      role: 'admin'
    }
  });

  console.log('👤 Created additional test user:', testCompany.email);

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
          name: 'Experiência em Desenvolvimento',
          description: 'Anos de experiência em desenvolvimento de software e complexidade dos projetos realizados',
          weight: 35,
          required: true,
          category: 'experience'
        },
        {
          name: 'Tecnologias Frontend',
          description: 'Conhecimento em React, JavaScript/TypeScript, HTML5, CSS3 e ferramentas modernas de desenvolvimento',
          weight: 25,
          required: true,
          category: 'skills'
        },
        {
          name: 'Tecnologias Backend',
          description: 'Experiência com Node.js, APIs REST, bancos de dados e arquitetura de sistemas',
          weight: 20,
          required: true,
          category: 'skills'
        },
        {
          name: 'Formação Acadêmica',
          description: 'Graduação em área relacionada à tecnologia (Ciência da Computação, Engenharia, etc.)',
          weight: 10,
          required: false,
          category: 'education'
        },
        {
          name: 'Inglês',
          description: 'Nível de fluência em inglês para comunicação técnica e documentação',
          weight: 10,
          required: false,
          category: 'languages'
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
          name: 'Portfólio e Experiência',
          description: 'Qualidade do portfólio, diversidade de projetos e anos de experiência em UX/UI',
          weight: 40,
          required: true,
          category: 'experience'
        },
        {
          name: 'Ferramentas de Design',
          description: 'Domínio de Figma, Adobe Creative Suite, Sketch e outras ferramentas de design',
          weight: 25,
          required: true,
          category: 'skills'
        },
        {
          name: 'UX Research e Estratégia',
          description: 'Conhecimento em pesquisa de usuário, design thinking, arquitetura de informação e usabilidade',
          weight: 20,
          required: true,
          category: 'skills'
        },
        {
          name: 'Comunicação e Colaboração',
          description: 'Habilidades de apresentação, trabalho em equipe e colaboração com desenvolvedores',
          weight: 15,
          required: false,
          category: 'other'
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
