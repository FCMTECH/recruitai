
'use client';

import { Brain, Calendar, Users, LogOut, Briefcase, User, Home, Plus, UsersRound } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';
import Image from 'next/image';
import { useState } from 'react';

export function DashboardHeader() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const isCompany = session?.user?.role === 'company';
  const isSuperAdmin = session?.user?.role === 'superadmin';
  const isCandidate = session?.user?.role === 'candidate';

  // Define o link da home baseado no role
  const homeLink = isCandidate ? '/candidate/dashboard' : isSuperAdmin ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeLink} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RecruitAI
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {isCompany && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Home</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs/create">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Criar Vaga</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs">
                <Button variant="ghost" size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Vagas</span>
                </Button>
              </Link>
              <Link href="/dashboard/talents">
                <Button variant="ghost" size="sm">
                  <UsersRound className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Talentos</span>
                </Button>
              </Link>
              <Link href="/dashboard/agenda">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Agenda</span>
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Equipe</span>
                </Button>
              </Link>
            </>
          )}

          {isCandidate && (
            <>
              <Link href="/vagas">
                <Button variant="ghost" size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Vagas</span>
                </Button>
              </Link>
              <Link href="/candidate/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Perfil</span>
                </Button>
              </Link>
            </>
          )}
          
          <NotificationBell />

          {/* Logo da Empresa */}
          {isCompany && (session.user as any).logoUrl && !logoError && (
            <Link href="/dashboard/profile" className="ml-2">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <Image
                  src={(session.user as any).logoUrl}
                  alt="Logo da empresa"
                  fill
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>
            </Link>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
