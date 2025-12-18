import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

// Verificar autenticação
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const validToken = process.env.MAINTENANCE_SECRET;

  if (!validToken) {
    console.error("MAINTENANCE_SECRET não configurado");
    return false;
  }

  return token === validToken;
}

// POST - Executar comando de manutenção
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: "Não autorizado. Token de manutenção inválido." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Campo 'action' é obrigatório" },
        { status: 400 }
      );
    }

    // Log da ação
    console.log(`[MAINTENANCE] Executando ação: ${action}`, params);

    let result;

    switch (action) {
      case "restart_server":
        result = await restartServer();
        break;

      case "clear_cache":
        result = await clearCache();
        break;

      case "check_database":
        result = await checkAndRepairDatabase();
        break;

      case "prisma_generate":
        result = await runPrismaGenerate();
        break;

      case "prisma_push":
        result = await runPrismaPush();
        break;

      case "run_seed":
        result = await runSeed();
        break;

      case "cleanup_orphans":
        result = await cleanupOrphans();
        break;

      case "get_logs":
        result = await getRecentLogs(params?.lines || 50);
        break;

      default:
        return NextResponse.json(
          { error: `Ação '${action}' não reconhecida` },
          { status: 400 }
        );
    }

    // Registrar no banco de dados
    await db.maintenanceLog.create({
      data: {
        action,
        params: params ? JSON.stringify(params) : null,
        result: JSON.stringify(result),
        status: result.success ? "success" : "error",
        executedAt: new Date(),
      },
    }).catch((err: unknown) => {
      console.error("Erro ao registrar log de manutenção:", err);
    });

    return NextResponse.json({
      success: result.success,
      action,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao executar manutenção:", error);
    return NextResponse.json(
      {
        error: "Erro ao executar comando de manutenção",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Reiniciar servidor
async function restartServer() {
  try {
    console.log("[MAINTENANCE] Reiniciando servidor...");
    
    // Matar processos do Next.js
    await execAsync("pkill -f 'next dev'");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Iniciar novo processo
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && nohup /usr/local/nvm/versions/node/v22.14.0/bin/node node_modules/.bin/next dev -p 3000 > /tmp/nextjs_dev.log 2>&1 &"
    );

    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      success: true,
      message: "Servidor reiniciado com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao reiniciar servidor",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Limpar cache do Next.js
async function clearCache() {
  try {
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && rm -rf .next && rm -rf .build"
    );

    return {
      success: true,
      message: "Cache limpo com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao limpar cache",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Verificar e reparar banco de dados
async function checkAndRepairDatabase() {
  try {
    // Verificar conexão
    await db.$queryRaw`SELECT 1`;

    // Verificar integridade básica
    const checks = {
      usersCount: await db.user.count(),
      jobsCount: await db.job.count(),
      applicationsCount: await db.application.count(),
      subscriptionsCount: await db.subscription.count(),
    };

    return {
      success: true,
      message: "Banco de dados está operacional",
      checks,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao verificar banco de dados",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Executar prisma generate
async function runPrismaGenerate() {
  try {
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && /usr/local/nvm/versions/node/v22.14.0/bin/yarn prisma generate"
    );

    return {
      success: true,
      message: "Prisma client gerado com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao gerar Prisma client",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Executar prisma db push
async function runPrismaPush() {
  try {
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && /usr/local/nvm/versions/node/v22.14.0/bin/yarn prisma db push --skip-generate"
    );

    return {
      success: true,
      message: "Schema do banco atualizado com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao atualizar schema do banco",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Executar seed
async function runSeed() {
  try {
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && /usr/local/nvm/versions/node/v22.14.0/bin/yarn tsx --require dotenv/config scripts/seed.ts"
    );

    return {
      success: true,
      message: "Seed executado com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao executar seed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Limpar registros órfãos
async function cleanupOrphans() {
  try {
    const { stdout, stderr } = await execAsync(
      "cd /home/ubuntu/ats_platform/nextjs_space && /usr/local/nvm/versions/node/v22.14.0/bin/yarn tsx scripts/cleanup_orphans_db.ts"
    );

    return {
      success: true,
      message: "Limpeza de órfãos executada com sucesso",
      output: stdout,
      errors: stderr || null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao limpar registros órfãos",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Obter logs recentes
async function getRecentLogs(lines: number = 50) {
  try {
    const { stdout } = await execAsync(
      `tail -n ${lines} /tmp/nextjs_dev.log`
    );

    return {
      success: true,
      message: `Últimas ${lines} linhas do log`,
      logs: stdout,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erro ao obter logs",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
