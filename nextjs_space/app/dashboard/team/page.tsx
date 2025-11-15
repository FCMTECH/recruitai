'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, UserPlus, Mail, Shield, Calendar, Trash2, Edit, ArrowLeft, Loader2, Users, Folder, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';

interface TeamGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  _count?: {
    members: number;
  };
}

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  groupId?: string;
  group?: {
    id: string;
    name: string;
    color?: string;
  };
  createdAt: string;
}

export default function TeamPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  // Estados para usuários
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    groupId: '',
  });

  // Estados para grupos
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TeamGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'company') {
        router.push('/dashboard');
        toast.error('Acesso negado');
      } else {
        fetchGroups();
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const res = await fetch('/api/team-groups');
      
      if (res.ok) {
        const data = await res.json();
        setGroups(data || []);
      } else {
        toast.error('Erro ao carregar grupos');
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch('/api/company-users');
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // CRUD de Grupos
  const handleCreateGroup = async () => {
    if (!groupFormData.name) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    try {
      const res = await fetch('/api/team-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });

      if (res.ok) {
        toast.success('Grupo criado com sucesso!');
        setIsGroupDialogOpen(false);
        setGroupFormData({ name: '', description: '', color: '#3b82f6' });
        fetchGroups();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao criar grupo');
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !groupFormData.name) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    try {
      const res = await fetch(`/api/team-groups/${selectedGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });

      if (res.ok) {
        toast.success('Grupo atualizado com sucesso!');
        setIsGroupDialogOpen(false);
        setSelectedGroup(null);
        setGroupFormData({ name: '', description: '', color: '#3b82f6' });
        fetchGroups();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao atualizar grupo');
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast.error('Erro ao atualizar grupo');
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`/api/team-groups/${selectedGroup.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Grupo deletado com sucesso!');
        setIsDeleteGroupDialogOpen(false);
        setSelectedGroup(null);
        fetchGroups();
        fetchUsers(); // Atualizar usuários pois podem ter perdido o grupo
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao deletar grupo');
      }
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      toast.error('Erro ao deletar grupo');
    }
  };

  // CRUD de Usuários
  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const res = await fetch('/api/company-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userFormData,
          groupId: userFormData.groupId || null
        }),
      });

      if (res.ok) {
        toast.success('Usuário criado com sucesso!');
        setIsUserDialogOpen(false);
        setUserFormData({ name: '', email: '', password: '', role: 'member', groupId: '' });
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/company-users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
        fetchUsers();
      } else {
        toast.error('Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/company-users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Usuário deletado com sucesso!');
        setIsDeleteUserDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error('Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
    }
  };

  const openEditGroup = (group: TeamGroup) => {
    setSelectedGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3b82f6',
    });
    setIsGroupDialogOpen(true);
  };

  const openCreateGroup = () => {
    setSelectedGroup(null);
    setGroupFormData({ name: '', description: '', color: '#3b82f6' });
    setIsGroupDialogOpen(true);
  };

  const openCreateUser = () => {
    setSelectedUser(null);
    setUserFormData({ name: '', email: '', password: '', role: 'member', groupId: '' });
    setIsUserDialogOpen(true);
  };

  if (status === 'loading' || isLoadingGroups || isLoadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Agrupar usuários por grupo
  const usersWithoutGroup = users.filter(u => !u.groupId);
  const usersByGroup: Record<string, CompanyUser[]> = {};
  
  groups.forEach(group => {
    usersByGroup[group.id] = users.filter(u => u.groupId === group.id);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Gestão de Equipe
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie grupos e membros da sua equipe
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Folder className="h-4 w-4 mr-2" />
              Grupos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Membros */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={openCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>

            {/* Membros sem grupo */}
            {usersWithoutGroup.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sem Grupo ({usersWithoutGroup.length})
                  </CardTitle>
                  <CardDescription>Membros não atribuídos a nenhum grupo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usersWithoutGroup.map((user) => (
                      <UserCard 
                        key={user.id} 
                        user={user} 
                        onToggleStatus={handleToggleUserStatus}
                        onDelete={(u) => {
                          setSelectedUser(u);
                          setIsDeleteUserDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Membros por grupo */}
            {groups.map((group) => (
              <Card key={group.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: group.color || '#3b82f6' }}
                    />
                    {group.name} ({usersByGroup[group.id]?.length || 0})
                  </CardTitle>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {usersByGroup[group.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {usersByGroup[group.id].map((user) => (
                        <UserCard 
                          key={user.id} 
                          user={user} 
                          onToggleStatus={handleToggleUserStatus}
                          onDelete={(u) => {
                            setSelectedUser(u);
                            setIsDeleteUserDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum membro neste grupo</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {users.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum membro cadastrado</p>
                  <Button className="mt-4" onClick={openCreateUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Membro
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Grupos */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={openCreateGroup}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>

            {groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <Card key={group.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: group.color || '#3b82f6' }}
                        />
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <CardDescription>{group.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {group._count?.members || 0} membros
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditGroup(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(group);
                              setIsDeleteGroupDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum grupo criado</p>
                  <Button className="mt-4" onClick={openCreateGroup}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog: Criar/Editar Usuário */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Editar Membro' : 'Adicionar Membro'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do membro da equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Senha de acesso"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group">Grupo (opcional)</Label>
                <Select
                  value={userFormData.groupId}
                  onValueChange={(value) => setUserFormData({ ...userFormData, groupId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem grupo</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
                {selectedUser ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Criar/Editar Grupo */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGroup ? 'Editar Grupo' : 'Criar Grupo'}
              </DialogTitle>
              <DialogDescription>
                Configure as informações do grupo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Nome do Grupo</Label>
                <Input
                  id="groupName"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="Ex: Tecnologia, Administrativo"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Descrição (opcional)</Label>
                <Input
                  id="groupDescription"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="Descrição do grupo"
                />
              </div>
              <div>
                <Label htmlFor="groupColor">Cor do Grupo</Label>
                <div className="flex gap-2">
                  <Input
                    id="groupColor"
                    type="color"
                    value={groupFormData.color}
                    onChange={(e) => setGroupFormData({ ...groupFormData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={groupFormData.color}
                    onChange={(e) => setGroupFormData({ ...groupFormData, color: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={selectedGroup ? handleUpdateGroup : handleCreateGroup}>
                {selectedGroup ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog: Deletar Usuário */}
        <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o usuário <strong>{selectedUser?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog: Deletar Grupo */}
        <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o grupo <strong>{selectedGroup?.name}</strong>?
                Os membros deste grupo não serão deletados, apenas ficarão sem grupo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Componente auxiliar para exibir card de usuário
function UserCard({ 
  user, 
  onToggleStatus,
  onDelete 
}: { 
  user: CompanyUser; 
  onToggleStatus: (id: string, status: boolean) => void;
  onDelete: (user: CompanyUser) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role === 'admin' ? 'Admin' : 'Membro'}
        </Badge>
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(user.id, user.isActive)}
        >
          {user.isActive ? 'Desativar' : 'Ativar'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(user)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
