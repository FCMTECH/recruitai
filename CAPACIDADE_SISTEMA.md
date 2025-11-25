# Capacidade do Sistema RecruitAI - Infraestrutura Atual

## Resumo Executivo

O sistema **RecruitAI** está hospedado em uma infraestrutura moderna e escalável, utilizando:
- **Next.js 14** (Framework Frontend/Backend)
- **PostgreSQL no Supabase** (Banco de Dados)
- **AWS S3** (Armazenamento de Arquivos)
- **Abacus.AI/Gemini** (Análise de IA)
- **Stripe** (Pagamentos)

---

## 📊 Capacidade Atual

### 1. **Banco de Dados (Supabase PostgreSQL)**

#### Limites do Plano Gratuito do Supabase:
- **Armazenamento**: 500 MB de banco de dados
- **Conexões simultâneas**: Até 60 conexões
- **Transferência de dados**: 2 GB/mês
- **Backup automático**: Não incluído no plano gratuito

#### Estimativa de Capacidade:

**Usuários:**
- **Candidatos**: ~10.000 - 15.000 candidatos com perfis completos
- **Empresas**: ~200 - 500 empresas ativas
- **Admins**: Ilimitado (leve impacto no banco)

**Vagas:**
- ~5.000 - 10.000 vagas ativas e históricas

**Candidaturas:**
- ~50.000 - 100.000 candidaturas (incluindo histórico)

**Observação**: Estes números são aproximados e dependem do volume de dados armazenados em cada registro (tamanho de currículos, descrições, etc.)

---

### 2. **Armazenamento de Arquivos (AWS S3)**

#### Limites:
- **Praticamente ilimitado** em termos de capacidade de armazenamento
- **Custos**: Pay-as-you-go após o Free Tier (primeiros 12 meses)

#### AWS S3 Free Tier (primeiros 12 meses):
- 5 GB de armazenamento padrão
- 20.000 requisições GET
- 2.000 requisições PUT

#### Estimativa de Capacidade:
- **Currículos**: Assumindo uma média de 500 KB por currículo:
  - Free Tier: ~10.000 currículos
  - Com custo adicional: Praticamente ilimitado (muito econômico)

---

### 3. **Processamento de IA (Abacus.AI/Gemini)**

#### Limites:
- Dependem dos créditos disponíveis na conta Abacus.AI
- Cada análise de currículo consome créditos

#### Estimativa:
- Com créditos moderados: **100-1.000 análises por dia**
- Escalável conforme necessidade através de planos Abacus.AI

---

### 4. **Sistema de Pagamentos (Stripe)**

#### Limites:
- **Sem limite de transações**
- Taxas por transação aplicadas conforme tabela Stripe

---

## 🚀 Escalabilidade

### Cenário 1: Crescimento Moderado (atual)
**Adequado para:**
- Até 500 empresas ativas
- Até 15.000 candidatos
- Até 100.000 candidaturas

**Infraestrutura necessária:**
- ✅ Supabase Free Tier (suficiente)
- ✅ AWS S3 Free Tier ou plano pago básico
- ✅ Abacus.AI com créditos moderados

---

### Cenário 2: Crescimento Acelerado
**Para:**
- 1.000+ empresas ativas
- 50.000+ candidatos
- 500.000+ candidaturas

**Infraestrutura necessária:**
- 🔄 **Upgrade Supabase** para plano Pro (~$25/mês)
  - 8 GB de banco de dados
  - 120 conexões simultâneas
  - 50 GB de transferência/mês
  - Backups automáticos

- 🔄 **AWS S3**: Plano pago (custo variável, mas econômico)
  - ~$0.023/GB/mês para armazenamento
  - ~$0.0004 por 1.000 requisições GET

- 🔄 **Abacus.AI**: Plano com mais créditos ou uso sob demanda

---

### Cenário 3: Escala Enterprise
**Para:**
- 5.000+ empresas
- 200.000+ candidatos
- Milhões de candidaturas

**Infraestrutura necessária:**
- 🔄 **Supabase Pro ou Team** (~$25-$599/mês)
  - Banco de dados escalável
  - Suporte prioritário
  - Backups e alta disponibilidade

- 🔄 **Servidor dedicado ou Kubernetes** para Next.js
  - Vercel Pro/Enterprise
  - AWS EC2 / ECS / EKS
  - Google Cloud Run / GKE

- 🔄 **CDN Global** (Cloudflare, AWS CloudFront)

- 🔄 **Cache Redis/Memcached** para melhorar performance

- 🔄 **Queue System** (AWS SQS, RabbitMQ) para processar análises de IA em background

---

## 💰 Estimativa de Custos por Cenário

### Cenário 1 (Atual - Moderado)
- **Supabase**: Gratuito
- **AWS S3**: ~$0 (Free Tier) ou ~$5-20/mês
- **Abacus.AI**: Variável (conforme uso)
- **Stripe**: Taxa por transação
- **Total estimado**: $0-50/mês

### Cenário 2 (Crescimento Acelerado)
- **Supabase Pro**: $25/mês
- **AWS S3**: ~$20-50/mês
- **Abacus.AI**: $100-300/mês (estimativa)
- **Vercel Pro** (opcional): $20/mês
- **Total estimado**: $165-395/mês

### Cenário 3 (Enterprise)
- **Supabase Team/Enterprise**: $599+/mês
- **AWS (EC2/ECS/S3/CloudFront)**: $500-2.000/mês
- **Abacus.AI**: $500-1.000+/mês
- **Redis/Queue**: $50-200/mês
- **Total estimado**: $1.649-3.799+/mês

---

## 🔍 Monitoramento e Otimização

### Recomendações para manter o sistema performático:

1. **Monitorar uso do banco de dados**:
   - Verificar tamanho regularmente no painel Supabase
   - Implementar limpeza de dados antigos (se necessário)

2. **Otimizar queries**:
   - Usar índices apropriados no Prisma
   - Implementar paginação em todas as listagens

3. **Cache**:
   - Implementar cache de respostas de API (Redis)
   - Usar Next.js ISR (Incremental Static Regeneration) quando possível

4. **Background Jobs**:
   - Mover análises de IA para processamento assíncrono
   - Implementar fila de processamento

5. **CDN**:
   - Usar CDN para assets estáticos
   - Configurar caching adequado

---

## ✅ Conclusão

**A infraestrutura atual do RecruitAI é adequada para:**
- ✅ Até 500 empresas ativas
- ✅ Até 15.000 candidatos
- ✅ Até 100.000 candidaturas
- ✅ Processamento de IA moderado

**Para crescimento além desses números:**
- 🔄 Planejar upgrade do Supabase para plano Pro
- 🔄 Monitorar custos AWS S3
- 🔄 Avaliar necessidade de servidor dedicado
- 🔄 Implementar otimizações (cache, background jobs)

**O sistema foi projetado com arquitetura escalável e pode crescer conforme a demanda, com investimento proporcional em infraestrutura.**

---

*Documento gerado em: 25 de Novembro de 2025*
*Sistema: RecruitAI v1.0*
