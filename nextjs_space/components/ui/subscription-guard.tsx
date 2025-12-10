
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Crown, Lock, TrendingUp } from "lucide-react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

export function SubscriptionGuard({ children, requireActive = false }: SubscriptionGuardProps) {
  const { subscription, isLoading } = useSubscription();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"expired" | "limit" | null>(null);

  useEffect(() => {
    if (!isLoading && requireActive) {
      if (subscription.isExpired) {
        setDialogType("expired");
        setShowDialog(true);
      } else if (subscription.isLimitReached) {
        setDialogType("limit");
        setShowDialog(true);
      }
    }
  }, [subscription, isLoading, requireActive]);

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}

      {/* Expired Subscription Dialog */}
      <Dialog open={showDialog && dialogType === "expired"} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Período de Teste Expirado</DialogTitle>
                <Badge variant="destructive" className="mt-1">Acesso Limitado</Badge>
              </div>
            </div>
            <DialogDescription className="text-base pt-2">
              Seu período de teste de 7 dias expirou. Para continuar criando vagas e usando todas as funcionalidades da plataforma, escolha um plano que atenda suas necessidades.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="font-medium">Com um plano ativo você terá:</span>
            </div>
            <ul className="text-sm text-slate-700 space-y-1 ml-6">
              <li>• Criação ilimitada de vagas por mês (conforme plano)</li>
              <li>• Análise de currículos com IA</li>
              <li>• Dashboards avançados e relatórios</li>
              <li>• Banco de talentos completo</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="w-full sm:w-auto"
            >
              Ver Depois
            </Button>
            <Button
              onClick={handleUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Planos e Preços
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Limit Reached Dialog */}
      <Dialog open={showDialog && dialogType === "limit"} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Limite de Vagas Atingido</DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  {subscription.plan?.jobsCreatedThisMonth} / {subscription.plan?.jobLimit} vagas
                </Badge>
              </div>
            </div>
            <DialogDescription className="text-base pt-2">
              Você atingiu o limite de {subscription.plan?.jobLimit} vagas por mês do plano{" "}
              <strong>{subscription.plan?.displayName}</strong>. Faça upgrade para criar mais vagas e expandir sua busca por talentos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span>Faça upgrade e receba:</span>
            </div>
            <ul className="text-sm text-slate-700 space-y-1 ml-6">
              <li>• Mais vagas por mês</li>
              <li>• Recursos avançados de IA</li>
              <li>• Análises e relatórios completos</li>
              <li>• Acesso prioritário ao banco de talentos</li>
            </ul>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <Button
              onClick={handleUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent"
            >
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
