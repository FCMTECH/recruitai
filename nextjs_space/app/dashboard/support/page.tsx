'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';

interface SupportMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  userId: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
  _count?: { messages: number };
}

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });
  
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'company') {
      router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated') {
      loadTickets();
    }
  }, [status, session, router, statusFilter]);

  async function loadTickets() {
    try {
      setIsLoading(true);
      const url = statusFilter === 'all' ? '/api/support' : `/api/support?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        toast.error(data.error || 'Erro ao carregar chamados');
      }
    } catch (error) {
      toast.error('Erro ao carregar chamados');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.subject || formData.subject.length < 5) {
      toast.error('Assunto deve ter no mínimo 5 caracteres');
      return;
    }
    
    if (!formData.message || formData.message.length < 10) {
      toast.error('Mensagem deve ter no mínimo 10 caracteres');
      return;
    }
    
    try {
      setIsCreating(true);
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Chamado criado com sucesso!');
        setShowCreateDialog(false);
        setFormData({ subject: '', message: '', priority: 'medium' });
        loadTickets();
      } else {
        toast.error(data.error || 'Erro ao criar chamado');
      }
    } catch (error) {
      toast.error('Erro ao criar chamado');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleViewDetails(ticketId: string) {
    try {
      const res = await fetch(`/api/support/${ticketId}`);
      const data = await res.json();
      
      if (res.ok) {
        setSelectedTicket(data.ticket);
        setShowDetailDialog(true);
      } else {
        toast.error(data.error || 'Erro ao carregar detalhes');
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes');
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error('Mensagem não pode estar vazia');
      return;
    }
    
    try {
      setIsSending(true);
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Resposta enviada!');
        setReplyMessage('');
        // Recarregar detalhes
        handleViewDetails(selectedTicket.id);
      } else {
        toast.error(data.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    } finally {
      setIsSending(false);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      open: { label: 'Aberto', variant: 'default' },
      in_progress: { label: 'Em andamento', variant: 'secondary' },
      waiting_company: { label: 'Aguardando você', variant: 'outline' },
      closed: { label: 'Finalizado', variant: 'destructive' },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getPriorityBadge(priority: string) {
    const variants: Record<string, { label: string; className: string }> = {
      low: { label: 'Baixa', className: 'bg-gray-500/10 text-gray-700' },
      medium: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-700' },
      high: { label: 'Alta', className: 'bg-red-500/10 text-red-700' },
    };
    const config = variants[priority] || variants.medium;
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Suporte
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus chamados de suporte
              </p>
            </div>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Abrir Chamado
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Filtrar por status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="waiting_company">Aguardando você</SelectItem>
                  <SelectItem value="closed">Finalizados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Chamados */}
        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhum chamado encontrado.
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ticket.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <span className="flex items-center gap-1 text-xs">
                          <MessageCircle className="h-3 w-3" />
                          {ticket._count?.messages || 0} mensagens
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(ticket.id)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Criado: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atualizado: {new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Dialog: Criar Chamado */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Abrir Novo Chamado</DialogTitle>
            <DialogDescription>
              Descreva seu problema ou dúvida com detalhes
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Problema ao criar vaga"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Descreva seu problema com detalhes..."
                rows={5}
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Chamado'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalhes do Chamado */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              {selectedTicket && getPriorityBadge(selectedTicket.priority)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              {/* Thread de Mensagens */}
              <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.isAdmin
                          ? 'bg-primary/10 ml-8'
                          : 'bg-card mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={msg.isAdmin ? 'default' : 'secondary'}>
                          {msg.isAdmin ? 'Suporte' : 'Você'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm">
                    Nenhuma mensagem ainda
                  </p>
                )}
              </div>
              
              {/* Responder */}
              {selectedTicket.status !== 'closed' && (
                <div className="space-y-2">
                  <Label htmlFor="reply">Sua Resposta</Label>
                  <Textarea
                    id="reply"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={3}
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={isSending || !replyMessage.trim()}
                    className="w-full gap-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {selectedTicket.status === 'closed' && (
                <div className="bg-muted p-4 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">
                    Este chamado foi finalizado.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
