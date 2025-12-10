
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewActionsProps {
  applicationId: string;
  application: any;
  onUpdate: () => void;
}

export function InterviewActions({ applicationId, application, onUpdate }: InterviewActionsProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isDocsDialogOpen, setIsDocsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState({
    interviewLink: '',
    interviewDate: '',
    message: '',
  });
  const [notes, setNotes] = useState(application?.interviewNotes || '');
  const [attended, setAttended] = useState(application?.attendedInterview || false);

  const handleInvite = async () => {
    if (!inviteData.interviewLink) {
      toast.error('Link de agendamento é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/applications/${applicationId}/invite-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData),
      });

      if (res.ok) {
        toast.success('Convite enviado com sucesso!');
        setIsInviteDialogOpen(false);
        setInviteData({ interviewLink: '', interviewDate: '', message: '' });
        onUpdate();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao enviar convite');
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/applications/${applicationId}/interview-notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewNotes: notes,
          attendedInterview: attended,
        }),
      });

      if (res.ok) {
        toast.success('Notas salvas com sucesso!');
        setIsNotesDialogOpen(false);
        onUpdate();
      } else {
        toast.error('Erro ao salvar notas');
      }
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      toast.error('Erro ao salvar notas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!application?.invitedForInterview ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Convidar para Entrevista
        </Button>
      ) : (
        <Badge variant="default" className="py-1 px-3">
          <CheckCircle className="h-3 w-3 mr-1" />
          Convidado em {new Date(application.invitedAt).toLocaleDateString('pt-BR')}
        </Badge>
      )}

      {application?.invitedForInterview && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNotes(application?.interviewNotes || '');
              setAttended(application?.attendedInterview || false);
              setIsNotesDialogOpen(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            {application?.interviewNotes ? 'Editar Notas' : 'Adicionar Notas'}
          </Button>

          {application.interviewLink && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(application.interviewLink, '_blank')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Link
            </Button>
          )}
        </>
      )}

      {/* Dialog para convidar para entrevista */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar para Entrevista</DialogTitle>
            <DialogDescription>
              Envie um convite de entrevista para {application?.candidateName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Link de Agendamento *</Label>
              <Input
                value={inviteData.interviewLink}
                onChange={(e) => setInviteData({ ...inviteData, interviewLink: e.target.value })}
                placeholder="https://calendly.com/... ou https://meet.google.com/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pode ser um link do Calendly, Google Meet, Zoom, etc.
              </p>
            </div>

            <div>
              <Label>Data e Hora (opcional)</Label>
              <Input
                type="datetime-local"
                value={inviteData.interviewDate}
                onChange={(e) => setInviteData({ ...inviteData, interviewDate: e.target.value })}
              />
            </div>

            <div>
              <Label>Mensagem Personalizada (opcional)</Label>
              <Textarea
                value={inviteData.message}
                onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                placeholder="Adicione uma mensagem personalizada para o candidato..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para notas da entrevista */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notas da Entrevista</DialogTitle>
            <DialogDescription>
              Adicione observações sobre a entrevista com {application?.candidateName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="attended"
                checked={attended}
                onChange={(e) => setAttended(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="attended" className="cursor-pointer">
                Candidato compareceu à entrevista
              </Label>
            </div>

            <div>
              <Label>Notas e Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva suas impressões, pontos fortes, áreas de melhoria, etc..."
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNotes} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
