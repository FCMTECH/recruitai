
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Shield, Trash2, Loader2, Mail, User, Key, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialog, setIsCreateDialog] = useState(false);
  const [isPasswordDialog, setIsPasswordDialog] = useState(false);
  const [isDeleteDialog, setIsDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'superadmin') {
        router.push('/dashboard');
      } else {
        loadAdmins();
      }
    }
  }, [status, session, router]);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (createForm.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        toast.success('Administrador criado com sucesso!');
        setIsCreateDialog(false);
        setCreateForm({ name: '', email: '', password: '' });
        loadAdmins();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar administrador');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar administrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedAdmin.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Administrador removido com sucesso!');
        setIsDeleteDialog(false);
        setSelectedAdmin(null);
        loadAdmins();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao remover administrador');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover administrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      if (res.ok) {
        toast.success('Senha alterada com sucesso!');
        setIsPasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="rounded-xl hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gerenciar Administradores
              </h1>
              <p className="text-muted-foreground mt-1">
                Controle de acesso ao painel administrativo
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsPasswordDialog(true)} variant="outline" className="rounded-xl gap-2">
              <Key className="h-4 w-4" />
              Trocar Senha
            </Button>
            <Button onClick={() => setIsCreateDialog(true)} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Novo Admin
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="rounded-2xl border-dashed border-2 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Importante</p>
                <p className="text-sm text-muted-foreground">
                  • Sempre mantenha pelo menos 1 administrador ativo<br />
                  • Não é possível remover sua própria conta<br />
                  • Senhas devem ter no mínimo 8 caracteres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Administradores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Administradores Ativos ({admins.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {admins.map((admin) => {
              const isCurrentUser = admin.email === session?.user?.email;
              
              return (
                <Card key={admin.id} className="rounded-2xl hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {admin.name || 'Sem nome'}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="rounded-lg">
                              Você
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {admin.email}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {!isCurrentUser && admins.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsDeleteDialog(true);
                            }}
                            className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Criado em: {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {admin.updatedAt !== admin.createdAt && (
                        <span>
                          Atualizado: {new Date(admin.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialog de Criar Admin */}
      <Dialog open={isCreateDialog} onOpenChange={setIsCreateDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Administrador</DialogTitle>
            <DialogDescription>
              Crie uma nova conta de administrador para o sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Nome do administrador"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Senha * (mínimo 8 caracteres)</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreateDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Administrador
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Trocar Senha */}
      <Dialog open={isPasswordDialog} onOpenChange={setIsPasswordDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
            <DialogDescription>
              Altere sua senha de administrador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual *</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword">Nova Senha * (mínimo 8 caracteres)</Label>
              <div className="relative mt-2">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
              <div className="relative mt-2">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPasswordDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Alterar Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialog} onOpenChange={setIsDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o administrador <strong>{selectedAdmin?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={isSaving}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
