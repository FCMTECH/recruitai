"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Brain, User } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  userName?: string | null;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
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
