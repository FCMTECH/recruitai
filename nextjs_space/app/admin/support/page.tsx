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
import { ArrowLeft, MessageCircle, Clock, Loader2, Send, Building2, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

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
  company: {
    id: string;
    companyName: string | null;
    email: string;
  };
  messages?: SupportMessage[];
  _count?: { messages: number };
}

export default function AdminSupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketPriority, setTicketPriority] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'superadmin') {
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

  async function handleViewDetails(ticketId: string) {
    try {
      const res = await fetch(`/api/support/${ticketId}`);
      const data = await res.json();
      
      if (res.ok) {
        setSelectedTicket(data.ticket);
        setTicketStatus(data.ticket.status);
        setTicketPriority(data.ticket.priority);
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

  async function handleUpdateTicket() {
    if (!selectedTicket) return;
    
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: ticketStatus,
          priority: ticketPriority,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Chamado atualizado!');
        loadTickets();
        handleViewDetails(selectedTicket.id);
      } else {
        toast.error(data.error || 'Erro ao atualizar chamado');
      }
    } catch (error) {
      toast.error('Erro ao atualizar chamado');
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      open: { label: 'Aberto', variant: 'destructive' },
      in_progress: { label: 'Em andamento', variant: 'default' },
      waiting_company: { label: 'Aguardando Empresa', variant: 'secondary' },
      closed: { label: 'Finalizado', variant: 'outline' },
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

  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(query) ||
      ticket.company.companyName?.toLowerCase().includes(query) ||
      ticket.company.email.toLowerCase().includes(query)
    );
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Central de Suporte</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por empresa, assunto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="waiting_company">Aguardando Empresa</SelectItem>
                    <SelectItem value="closed">Finalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Chamados */}
        <div className="grid gap-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhum chamado encontrado.
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ticket.subject}</CardTitle>
                      <CardDescription className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                          <span className="flex items-center gap-1 text-xs">
                            <MessageCircle className="h-3 w-3" />
                            {ticket._count?.messages || 0} mensagens
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4" />
                          <span>{ticket.company.companyName || 'Sem nome'}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(ticket.id)}
                    >
                      Gerenciar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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

      {/* Dialog: Detalhes e Gestão do Chamado */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription className="space-y-2">
              <div className="flex items-center gap-2">
                {selectedTicket && getStatusBadge(selectedTicket.status)}
                {selectedTicket && getPriorityBadge(selectedTicket.priority)}
              </div>
              {selectedTicket && (
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {selectedTicket.company.companyName || 'Sem nome'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedTicket.company.email}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              {/* Gerenciamento de Status/Prioridade */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gerenciar Chamado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={ticketStatus} onValueChange={setTicketStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Aberto</SelectItem>
                          <SelectItem value="in_progress">Em andamento</SelectItem>
                          <SelectItem value="waiting_company">Aguardando Empresa</SelectItem>
                          <SelectItem value="closed">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={ticketPriority} onValueChange={setTicketPriority}>
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
                  </div>
                  <Button
                    onClick={handleUpdateTicket}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      'Atualizar Status/Prioridade'
                    )}
                  </Button>
                </CardContent>
              </Card>
              
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
                          {msg.isAdmin ? 'Suporte (Você)' : 'Empresa'}
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
              <div className="space-y-2">
                <Label htmlFor="reply">Responder Empresa</Label>
                <Textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={4}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
