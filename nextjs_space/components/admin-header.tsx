"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { LogOut, User, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  userName?: string | null;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    fetchPendingRequests();
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Logo href="/admin" />
            <Badge className="bg-stone-900 text-white text-xs">Admin</Badge>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/admin" className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/companies" className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors">
              Empresas
            </Link>
            <Link href="/admin/subscriptions" className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors">
              Assinaturas
            </Link>
            <Link href="/admin/support" className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-50 transition-colors">
              Suporte
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/admin/custom-plan-requests">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-stone-500" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/admin/profile">
              <Button variant="ghost" size="sm" className="gap-2 text-stone-600">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName || "Admin"}</span>
              </Button>
            </Link>

            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
