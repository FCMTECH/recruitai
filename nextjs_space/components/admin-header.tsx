"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Brain, User, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  userName?: string | null;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    fetchPendingRequests();
    // Atualizar a cada 2 minutos para melhor performance
    const interval = setInterval(fetchPendingRequests, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/custom-plan-requests?status=pending');
      if (response.ok) {
        const data = await response.json();
        setPendingRequestsCount(data.stats?.pending || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
    }
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-10 mb-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-sm text-muted-foreground">Visão global da plataforma ATS</p>
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-3">
            {/* Notificações de Planos Personalizados */}
            <Link href="/admin/custom-plan-requests">
              <Button variant="outline" className="gap-2 relative">
                <Bell className="h-4 w-4" />
                {pendingRequestsCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                  >
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Botão de Perfil */}
            <Link href="/admin/profile">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                {userName || "Admin"}
              </Button>
            </Link>

            {/* Botão de Sair */}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
