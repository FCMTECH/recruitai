
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href={homeLink} className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-accent transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RecruitAI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {isCompany && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Home</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs/create">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">Nova Vaga</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden md:inline">Vagas</span>
                </Button>
              </Link>
              <Link href="/dashboard/talents">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <UsersRound className="h-4 w-4" />
                  <span className="hidden lg:inline">Talentos</span>
                </Button>
              </Link>
              <Link href="/dashboard/agenda">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden lg:inline">Agenda</span>
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Users className="h-4 w-4" />
                  <span className="hidden lg:inline">Equipe</span>
                </Button>
              </Link>
            </>
          )}

          {isCandidate && (
            <>
              <Link href="/vagas">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Vagas</span>
                </Button>
              </Link>
              <Link href="/candidate/profile">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-sm font-medium hover:bg-muted/50">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Divider */}
          <div className="h-6 w-px bg-border/60 mx-2" />
          
          {/* Notification */}
          <NotificationBell />

          {/* Profile/Logo */}
          {isCompany && (session.user as any).logoUrl && !logoError ? (
            <Link href="/dashboard/profile" className="ml-1">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/40 hover:border-primary/40 transition-all hover:shadow-sm">
                <Image
                  src={(session.user as any).logoUrl}
                  alt="Logo"
                  fill
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>
            </Link>
          ) : (
            <Link href={isCompany ? "/dashboard/profile" : "/candidate/profile"}>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-muted/50">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          {/* Logout */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-8 w-8 rounded-lg p-0 ml-1 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
