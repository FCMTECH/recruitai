
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Shield, Users, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';

interface Permission {
  id: string;
  name: string;
  canViewAllJobs: boolean;
  canViewOwnGroupJobs: boolean;
  canViewAllProfiles: boolean;
  canViewAllApplications: boolean;
  canViewOwnApplications: boolean;
  canViewTeamMembers: boolean;
  canViewAllGroups: boolean;
  canViewOwnGroup: boolean;
  canCreateJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canManageApplications: boolean;
  canHireCandidates: boolean;
  canInviteInterviews: boolean;
  canManageTeam: boolean;
  canManageGroups: boolean;
  canAccessReports: boolean;
  _count?: {
    members: number;
  };
}

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    canViewAllJobs: true,
    canViewOwnGroupJobs: false,
    canViewAllProfiles: true,
    canViewAllApplications: true,
    canViewOwnApplications: false,
    canViewTeamMembers: true,
    canViewAllGroups: true,
    canViewOwnGroup: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canManageApplications: false,
    canHireCandidates: false,
    canInviteInterviews: false,
    canManageTeam: false,
    canManageGroups: false,
    canAccessReports: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'company') {
        router.push('/dashboard');
      } else {
        loadPermissions();
      }
    }
  }, [status, session, router]);

  const loadPermissions = async () => {
    try {
      const res = await fetch('/api/permissions');
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedPermission(null);
    setFormData({
      name: '',
      canViewAllJobs: true,
      canViewOwnGroupJobs: false,
      canViewAllProfiles: true,
      canViewAllApplications: true,
      canViewOwnApplications: false,
      canViewTeamMembers: true,
      canViewAllGroups: true,
      canViewOwnGroup: false,
      canCreateJobs: false,
      canEditJobs: false,
      canDeleteJobs: false,
      canManageApplications: false,
      canHireCandidates: false,
      canInviteInterviews: false,
      canManageTeam: false,
      canManageGroups: false,
      canAccessReports: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      canViewAllJobs: permission.canViewAllJobs,
      canViewOwnGroupJobs: permission.canViewOwnGroupJobs,
      canViewAllProfiles: permission.canViewAllProfiles,
      canViewAllApplications: permission.canViewAllApplications,
      canViewOwnApplications: permission.canViewOwnApplications,
      canViewTeamMembers: permission.canViewTeamMembers,
      canViewAllGroups: permission.canViewAllGroups,
      canViewOwnGroup: permission.canViewOwnGroup,
      canCreateJobs: permission.canCreateJobs,
      canEditJobs: permission.canEditJobs,
      canDeleteJobs: permission.canDeleteJobs,
      canManageApplications: permission.canManageApplications,
      canHireCandidates: permission.canHireCandidates,
      canInviteInterviews: permission.canInviteInterviews,
      canManageTeam: permission.canManageTeam,
      canManageGroups: permission.canManageGroups,
      canAccessReports: permission.canAccessReports,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da permissão é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const url = selectedPermission 
        ? `/api/permissions/${selectedPermission.id}`
        : '/api/permissions';
      
      const method = selectedPermission ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(selectedPermission ? 'Permissão atualizada!' : 'Permissão criada!');
        setIsDialogOpen(false);
        loadPermissions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao salvar permissão');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar permissão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/permissions/${selectedPermission.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Permissão removida!');
        setIsDeleteDialogOpen(false);
        loadPermissions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao remover permissão');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover permissão');
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
      <DashboardHeader />
      
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/team')}
              className="rounded-xl hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Permissões de Membros
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie perfis de permissão para sua equipe
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Nova Permissão
          </Button>
        </div>

        {/* Lista de Permissões */}
        <div className="grid gap-4">
          {permissions.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum perfil de permissão criado ainda
                </p>
                <Button onClick={openCreateDialog} className="mt-4 rounded-xl">
                  Criar Primeiro Perfil
                </Button>
              </CardContent>
            </Card>
          ) : (
            permissions.map((permission) => (
              <Card key={permission.id} className="rounded-2xl hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {permission.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Users className="h-4 w-4" />
                        {permission._count?.members || 0} membro(s) com esta permissão
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(permission)}
                        className="rounded-xl hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPermission(permission);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {permission.canViewAllJobs && (
                      <Badge variant="secondary" className="rounded-lg">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver todas vagas
                      </Badge>
                    )}
                    {permission.canCreateJobs && (
                      <Badge variant="secondary" className="rounded-lg">
                        Criar vagas
                      </Badge>
                    )}
                    {permission.canManageApplications && (
                      <Badge variant="secondary" className="rounded-lg">
                        Gerenciar candidaturas
                      </Badge>
                    )}
                    {permission.canHireCandidates && (
                      <Badge variant="secondary" className="rounded-lg">
                        Contratar
                      </Badge>
                    )}
                    {permission.canManageTeam && (
                      <Badge variant="secondary" className="rounded-lg">
                        Gerenciar equipe
                      </Badge>
                    )}
                    {permission.canAccessReports && (
                      <Badge variant="secondary" className="rounded-lg">
                        Acessar relatórios
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? 'Editar Permissão' : 'Nova Permissão'}
            </DialogTitle>
            <DialogDescription>
              Configure as permissões para este perfil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome do Perfil</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Recrutador, Gerente, Analista"
                className="rounded-xl mt-2"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Permissões de Visualização</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="canViewAllJobs">Ver todas as vagas</Label>
                <Switch
                  id="canViewAllJobs"
                  checked={formData.canViewAllJobs}
                  onCheckedChange={(checked) => setFormData({ ...formData, canViewAllJobs: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canViewAllProfiles">Ver perfil de todos candidatos</Label>
                <Switch
                  id="canViewAllProfiles"
                  checked={formData.canViewAllProfiles}
                  onCheckedChange={(checked) => setFormData({ ...formData, canViewAllProfiles: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canViewAllApplications">Ver todas as candidaturas</Label>
                <Switch
                  id="canViewAllApplications"
                  checked={formData.canViewAllApplications}
                  onCheckedChange={(checked) => setFormData({ ...formData, canViewAllApplications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canViewTeamMembers">Ver membros da equipe</Label>
                <Switch
                  id="canViewTeamMembers"
                  checked={formData.canViewTeamMembers}
                  onCheckedChange={(checked) => setFormData({ ...formData, canViewTeamMembers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canViewAllGroups">Ver todos os grupos</Label>
                <Switch
                  id="canViewAllGroups"
                  checked={formData.canViewAllGroups}
                  onCheckedChange={(checked) => setFormData({ ...formData, canViewAllGroups: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Permissões de Ação</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="canCreateJobs">Criar vagas</Label>
                <Switch
                  id="canCreateJobs"
                  checked={formData.canCreateJobs}
                  onCheckedChange={(checked) => setFormData({ ...formData, canCreateJobs: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canEditJobs">Editar vagas</Label>
                <Switch
                  id="canEditJobs"
                  checked={formData.canEditJobs}
                  onCheckedChange={(checked) => setFormData({ ...formData, canEditJobs: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canManageApplications">Gerenciar candidaturas</Label>
                <Switch
                  id="canManageApplications"
                  checked={formData.canManageApplications}
                  onCheckedChange={(checked) => setFormData({ ...formData, canManageApplications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canHireCandidates">Contratar candidatos</Label>
                <Switch
                  id="canHireCandidates"
                  checked={formData.canHireCandidates}
                  onCheckedChange={(checked) => setFormData({ ...formData, canHireCandidates: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canInviteInterviews">Convidar para entrevistas</Label>
                <Switch
                  id="canInviteInterviews"
                  checked={formData.canInviteInterviews}
                  onCheckedChange={(checked) => setFormData({ ...formData, canInviteInterviews: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canManageTeam">Gerenciar equipe</Label>
                <Switch
                  id="canManageTeam"
                  checked={formData.canManageTeam}
                  onCheckedChange={(checked) => setFormData({ ...formData, canManageTeam: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canAccessReports">Acessar relatórios</Label>
                <Switch
                  id="canAccessReports"
                  checked={formData.canAccessReports}
                  onCheckedChange={(checked) => setFormData({ ...formData, canAccessReports: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedPermission ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta permissão?
              {selectedPermission && selectedPermission._count && selectedPermission._count.members > 0 && (
                <span className="block mt-2 text-destructive font-semibold">
                  Atenção: {selectedPermission._count.members} membro(s) estão usando esta permissão.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
