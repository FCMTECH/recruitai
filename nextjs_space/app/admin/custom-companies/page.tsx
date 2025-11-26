'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Building2, Loader2, Mail, Phone, CheckCircle, Clock, XCircle, ExternalLink, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyInvitation {
  id: string
  email: string
  companyName: string
  tradeName?: string
  cnpj?: string
  phone?: string
  customPlanName: string
  customJobLimit: number
  customPrice: number
  customFeatures: string[]
  status: string
  createdAt: string
  completedAt?: string
  createdByName: string
  notes?: string
}

export default function CustomCompaniesPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  const [invitations, setInvitations] = useState<CompanyInvitation[]>([])
  const [filteredInvitations, setFilteredInvitations] = useState<CompanyInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Formulário de criação
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    tradeName: '',
    cnpj: '',
    phone: '',
    customJobLimit: 50,
    customPrice: 500,
    notes: '',
  })

  const defaultFeatures = [
    'Vagas customizadas',
    'Membros ilimitados',
    'Grupos ilimitados',
    'Suporte prioritário',
    'Análise de IA ilimitada',
    'Dashboard avançado',
    'Relatórios personalizados',
    'Integrações avançadas',
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role
      if (userRole !== 'superadmin') {
        router.push('/dashboard')
      } else {
        loadInvitations()
      }
    }
  }, [status, session])

  useEffect(() => {
    filterInvitations()
  }, [invitations, filterStatus, searchTerm])

  const loadInvitations = async () => {
    try {
      const res = await fetch(`/api/admin/company-invitations?status=${filterStatus}`)
      if (res.ok) {
        const data = await res.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
      toast.error('Erro ao carregar convites')
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvitations = () => {
    let filtered = invitations

    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status === filterStatus)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        inv =>
          inv.email.toLowerCase().includes(term) ||
          inv.companyName.toLowerCase().includes(term) ||
          inv.phone?.toLowerCase().includes(term)
      )
    }

    setFilteredInvitations(filtered)
  }

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      if (!formData.email || !formData.companyName) {
        toast.error('E-mail e Razão Social são obrigatórios')
        return
      }

      const res = await fetch('/api/admin/companies/create-with-custom-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customFeatures: defaultFeatures,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar convite')
        return
      }

      toast.success('Convite criado com sucesso! E-mail enviado para a empresa.')
      setIsDialogOpen(false)
      setFormData({
        email: '',
        companyName: '',
        tradeName: '',
        cnpj: '',
        phone: '',
        customJobLimit: 50,
        customPrice: 500,
        notes: '',
      })
      loadInvitations()
    } catch (error) {
      console.error('Erro ao criar convite:', error)
      toast.error('Erro ao criar convite')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
      password_set: { label: 'Senha Criada', variant: 'default', icon: CheckCircle },
      payment_pending: { label: 'Aguardando Pagamento', variant: 'outline', icon: Clock },
      completed: { label: 'Concluído', variant: 'default', icon: CheckCircle },
      expired: { label: 'Expirado', variant: 'destructive', icon: XCircle },
    }

    const config = statusMap[status] || { label: status, variant: 'outline' as const, icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Empresas Personalizadas
              </h1>
              <p className="text-muted-foreground">Gerencie empresas com planos customizados</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Empresa com Plano Personalizado</DialogTitle>
                <DialogDescription>
                  A empresa receberá um e-mail com instruções para configurar a conta e realizar o pagamento
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Razão Social *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input
                      id="tradeName"
                      value={formData.tradeName}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Configurações do Plano Personalizado</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customJobLimit">Quantitativo de Vagas *</Label>
                      <Input
                        id="customJobLimit"
                        type="number"
                        min="1"
                        value={formData.customJobLimit}
                        onChange={(e) => setFormData({ ...formData, customJobLimit: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customPrice">Valor Mensal (R$) *</Label>
                      <Input
                        id="customPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.customPrice}
                        onChange={(e) => setFormData({ ...formData, customPrice: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Internas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Notas internas sobre esta empresa ou plano (não visível para a empresa)"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
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
                      'Criar e Enviar Convite'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por e-mail, empresa ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="password_set">Senha Criada</SelectItem>
                  <SelectItem value="payment_pending">Aguardando Pagamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Convites */}
        <div className="grid gap-4">
          {filteredInvitations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Nenhuma empresa encontrada com os filtros aplicados'
                    : 'Nenhuma empresa personalizada cadastrada ainda'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInvitations.map((invitation) => (
              <Card key={invitation.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{invitation.companyName}</CardTitle>
                        {getStatusBadge(invitation.status)}
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {invitation.email}
                        </div>
                        {invitation.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {invitation.phone}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vagas/Mês</p>
                      <p className="text-lg font-bold text-primary">{invitation.customJobLimit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="text-lg font-bold text-primary">R$ {invitation.customPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Criado em</p>
                      <p className="text-sm">{new Date(invitation.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Criado por</p>
                      <p className="text-sm">{invitation.createdByName}</p>
                    </div>
                  </div>

                  {invitation.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">{invitation.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {invitation.customFeatures.slice(0, 4).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {invitation.customFeatures.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{invitation.customFeatures.length - 4} mais
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
