
'use client';

import { Brain, Calendar, Users, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function DashboardHeader() {
  const { data: session } = useSession() || {};
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const isCompany = session?.user?.role === 'company';
  const isSuperAdmin = session?.user?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RecruitAI
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {isCompany && (
            <>
              <Link href="/dashboard/agenda">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Agenda</span>
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Equipe</span>
                </Button>
              </Link>
            </>
          )}
          
          <NotificationBell />
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
