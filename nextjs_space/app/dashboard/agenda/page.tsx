
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, ArrowLeft, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees: string[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
}

export default function AgendaPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'event' | 'task'>('event');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'company' && session?.user?.role !== 'superadmin') {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, tasksRes] = await Promise.all([
        fetch('/api/calendar'),
        fetch('/api/tasks'),
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Evento criado com sucesso!');
        setIsDialogOpen(false);
        setFormData({});
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar evento');
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
    }
  };

  const handleCreateTask = async () => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Tarefa criada com sucesso!');
        setIsDialogOpen(false);
        setFormData({});
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar tarefa');
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta');
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const openDialog = (type: 'event' | 'task') => {
    setDialogType(type);
    setFormData({});
    setIsDialogOpen(true);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />
      
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Agenda e Tarefas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus eventos e tarefas
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => openDialog('event')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
            <Button onClick={() => openDialog('task')} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="events">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Eventos ({events.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Tarefas ({tasks.filter(t => t.status !== 'completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum evento agendado</p>
                  <Button onClick={() => openDialog('event')} className="mt-4">
                    Criar primeiro evento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant={event.eventType === 'interview' ? 'default' : 'outline'}>
                          {event.eventType === 'meeting' ? '📅 Reunião' : 
                           event.eventType === 'interview' ? '🎯 Entrevista' : '⏰ Lembrete'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2">{event.title}</CardTitle>
                      {event.description && (
                        <CardDescription>{event.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {new Date(event.startDateTime).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees?.length > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {event.attendees.length} participante(s)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma tarefa cadastrada</p>
                  <Button onClick={() => openDialog('task')} className="mt-4">
                    Criar primeira tarefa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-start gap-4 p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'outline'
                          }>
                            {task.priority === 'high' ? '🔴 Alta' :
                             task.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            📅 Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'event' ? 'Novo Evento' : 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'event' 
                ? 'Agende uma reunião, entrevista ou lembrete'
                : 'Crie uma nova tarefa para acompanhar'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={dialogType === 'event' ? 'Ex: Reunião com candidato' : 'Ex: Revisar currículos'}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes adicionais..."
                rows={3}
              />
            </div>

            {dialogType === 'event' ? (
              <>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.eventType || 'meeting'}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="interview">Entrevista</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data/Hora Início *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.startDateTime || ''}
                      onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Data/Hora Fim *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.endDateTime || ''}
                      onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Local / Link</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: https://meet.google.com/..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.priority || 'medium'}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={dialogType === 'event' ? handleCreateEvent : handleCreateTask}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
