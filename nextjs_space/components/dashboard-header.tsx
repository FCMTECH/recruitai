
'use client';

import { Brain, Calendar, Users, LogOut, Briefcase, User, Home, Plus, UsersRound, Sparkles, MessageCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-2xl shadow-lg shadow-primary/5">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo - Design Moderno com Animações */}
        <Link href={homeLink} className="flex items-center gap-3 group relative">
          {/* Efeito de brilho de fundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300">
            <Brain className="h-6 w-6 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <span className="relative text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            RecruitAI
          </span>
        </Link>

        {/* Navigation - Botões Modernos com Animações */}
        <nav className="flex items-center gap-2">
          {isCompany && (
            <>
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Home className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline relative">Home</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs/create">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-accent/10 hover:text-accent hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Plus className="h-4 w-4 relative group-hover:rotate-90 transition-transform" />
                  <span className="hidden lg:inline relative">Nova Vaga</span>
                </Button>
              </Link>
              <Link href="/dashboard/jobs">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Briefcase className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline relative">Vagas</span>
                </Button>
              </Link>
              <Link href="/dashboard/talents">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-accent/10 hover:text-accent hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <UsersRound className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline relative">Talentos</span>
                </Button>
              </Link>
              <Link href="/dashboard/agenda">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Calendar className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline relative">Agenda</span>
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-accent/10 hover:text-accent hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Users className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline relative">Equipe</span>
                </Button>
              </Link>
              <Link href="/dashboard/support">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <MessageCircle className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:inline relative">Suporte</span>
                </Button>
              </Link>
            </>
          )}

          {isCandidate && (
            <>
              <Link href="/vagas">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Briefcase className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline relative">Vagas</span>
                </Button>
              </Link>
              <Link href="/candidate/profile">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 gap-2.5 px-4 text-sm font-semibold rounded-xl hover:bg-accent/10 hover:text-accent hover:scale-105 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <User className="h-4 w-4 relative group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline relative">Perfil</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Divider Moderno com Gradiente */}
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-2" />
          
          {/* Notification */}
          <NotificationBell />

          {/* Profile/Logo com Efeitos Avançados */}
          {isCompany && (session.user as any).logoUrl && !logoError ? (
            <Link href="/dashboard/profile" className="ml-1">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 hover:ring-primary/60 hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/30 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 rounded-xl p-0 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          {/* Logout com Design Aprimorado */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl p-0 ml-1 hover:bg-destructive/15 hover:text-destructive hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-destructive/20 group"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
