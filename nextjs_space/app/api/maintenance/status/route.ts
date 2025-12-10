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

// GET - Status do sistema
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: "Não autorizado. Token de manutenção inválido." },
        { status: 401 }
      );
    }

    // Verificar status do banco de dados
    const dbStatus = await checkDatabaseStatus();

    // Verificar status do servidor
    const serverStatus = await checkServerStatus();

    // Verificar uso de memória
    const memoryUsage = process.memoryUsage();

    // Verificar estatísticas
    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      server: serverStatus,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      },
      stats,
    });
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status do sistema", details: error },
      { status: 500 }
    );
  }
}

// Verificar status do banco de dados
async function checkDatabaseStatus() {
  try {
    await db.$queryRaw`SELECT 1`;
    return {
      status: "online",
      message: "Conexão com banco de dados OK",
    };
  } catch (error) {
    return {
      status: "offline",
      message: "Erro na conexão com banco de dados",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Verificar status do servidor
async function checkServerStatus() {
  try {
    const { stdout: nodeProcesses } = await execAsync("pgrep -f 'next dev' | wc -l");
    const processCount = parseInt(nodeProcesses.trim());

    return {
      status: processCount > 0 ? "running" : "stopped",
      processes: processCount,
      uptime: process.uptime(),
      nodeVersion: process.version,
    };
  } catch (error) {
    return {
      status: "unknown",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Obter estatísticas do sistema
async function getSystemStats() {
  try {
    const [usersCount, companiesCount, jobsCount, applicationsCount] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "company" } }),
      db.job.count(),
      db.application.count(),
    ]);

    return {
      users: usersCount,
      companies: companiesCount,
      jobs: jobsCount,
      applications: applicationsCount,
    };
  } catch (error) {
    return {
      error: "Erro ao obter estatísticas",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
