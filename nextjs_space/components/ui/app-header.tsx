"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  User,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  variant?: "default" | "admin" | "candidate";
}

export function AppHeader({ variant = "default" }: AppHeaderProps) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userRole = (session?.user as any)?.role;
  const userName = session?.user?.name || "Usuário";
  const companyName = (session?.user as any)?.companyName;

  const getNavItems = () => {
    if (variant === "admin") {
      return [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/companies", label: "Empresas", icon: Briefcase },
        { href: "/admin/jobs", label: "Vagas", icon: Briefcase },
        { href: "/admin/candidates", label: "Candidatos", icon: Users },
        { href: "/admin/subscriptions", label: "Assinaturas", icon: Settings },
      ];
    }
    if (variant === "candidate") {
      return [
        { href: "/candidate/dashboard", label: "Minhas Candidaturas", icon: Briefcase },
        { href: "/vagas", label: "Explorar Vagas", icon: Users },
        { href: "/candidate/profile", label: "Meu Perfil", icon: User },
      ];
    }
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/jobs", label: "Vagas", icon: Briefcase },
      { href: "/dashboard/talents", label: "Talentos", icon: Users },
      { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
      { href: "/dashboard/team", label: "Equipe", icon: Users },
    ];
  };

  const navItems = getNavItems();
  const dashboardHref = variant === "admin" ? "/admin" : variant === "candidate" ? "/candidate/dashboard" : "/dashboard";
  const profileHref = variant === "admin" ? "/admin/profile" : variant === "candidate" ? "/candidate/profile" : "/dashboard/profile";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200"
          : "bg-white border-b border-stone-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo href={dashboardHref} size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-stone-100 text-stone-900"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {status === "authenticated" && <NotificationBell />}

            {/* User Menu */}
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-stone-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-stone-800 truncate max-w-[120px]">
                        {userName}
                      </p>
                      {companyName && (
                        <p className="text-xs text-stone-500 truncate max-w-[120px]">
                          {companyName}
                        </p>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-800">{userName}</p>
                    <p className="text-xs text-stone-500">{session?.user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => router.push(profileHref)}>
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/support")}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Suporte
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/auth/signin")}>
                  Entrar
                </Button>
                <Button onClick={() => router.push("/auth/signup")} className="bg-stone-900 hover:bg-stone-800">
                  Criar Conta
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                      isActive
                        ? "bg-stone-100 text-stone-900"
                        : "text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
