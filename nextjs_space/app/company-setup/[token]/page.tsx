'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Eye, EyeOff, Loader2, CheckCircle, XCircle, CreditCard, Building2, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface InvitationData {
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
}

export default function CompanySetupPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = params?.token as string

  const [step, setStep] = useState<'loading' | 'password' | 'payment' | 'error'>('loading')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token])

  useEffect(() => {
    if (searchParams?.get('canceled') === 'true') {
      toast.error('Pagamento cancelado. Você pode tentar novamente quando desejar.')
    }
  }, [searchParams])

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/company-setup/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!data.valid) {
        setError(data.error || 'Convite inválido')
        setStep('error')
        return
      }

      setInvitation(data.invitation)

      // Definir step baseado no status
      if (data.invitation.status === 'pending') {
        setStep('password')
      } else if (data.invitation.status === 'password_set') {
        setStep('payment')
      } else if (data.invitation.status === 'payment_pending') {
        setStep('payment')
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      setError('Erro ao verificar convite')
      setStep('error')
    }
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres')
        return
      }

      if (password !== confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }

      const res = await fetch('/api/company-setup/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar senha')
        return
      }

      toast.success('Senha criada com sucesso!')
      setStep('payment')
    } catch (error) {
      console.error('Erro ao criar senha:', error)
      toast.error('Erro ao criar senha')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProceedToPayment = async () => {
    setIsProcessing(true)

    try {
      const res = await fetch('/api/company-setup/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar sessão de pagamento')
        return
      }

      // Redirecionar para Stripe Checkout
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      toast.error('Erro ao processar pagamento')
      setIsProcessing(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <XCircle className="h-6 w-6" />
              <CardTitle>Convite Inválido</CardTitle>
            </div>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, entre em contato com o suporte se você acredita que isso é um erro.
            </p>
            <div className="space-y-2 text-sm">
              <p>📧 E-mail: <a href="mailto:comercial@fcmtech.com.br" className="text-primary hover:underline">comercial@fcmtech.com.br</a></p>
              <p>💬 WhatsApp: (91) 99999-9999</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header com logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RecruitAI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Configure sua conta empresarial
          </p>
        </div>

        {/* Detalhes do Plano */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Seu Plano Personalizado</CardTitle>
            </div>
            <CardDescription>
              {invitation.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vagas por Mês</p>
                <p className="text-2xl font-bold text-primary">{invitation.customJobLimit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Mensal</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {invitation.customPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Recursos Incluídos:</p>
              <div className="flex flex-wrap gap-2">
                {invitation.customFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    ✅ {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center gap-2 ${step === 'password' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-primary text-primary-foreground' : 
              step === 'password' ? 'bg-primary text-primary-foreground' : 
              'bg-muted'
            }`}>
              {step === 'payment' ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Criar Senha</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Pagamento</span>
          </div>
        </div>

        {/* Formulário de Senha */}
        {step === 'password' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Crie sua Senha</CardTitle>
              </div>
              <CardDescription>
                Esta será a senha para acessar sua conta na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitation.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando senha...
                    </>
                  ) : (
                    'Continuar para Pagamento'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pagamento */}
        {step === 'payment' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle>Confirmar Pagamento</CardTitle>
              </div>
              <CardDescription>
                Você será redirecionado para o checkout seguro do Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{invitation.customPlanName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vagas/mês:</span>
                  <span className="font-medium">{invitation.customJobLimit}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Mensal:</span>
                  <span className="text-primary">R$ {invitation.customPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Formas de Pagamento Aceitas:
                </p>
                <ul className="ml-6 space-y-1 text-muted-foreground">
                  <li>💳 Cartão de Crédito (cobrança recorrente)</li>
                  <li>🏦 Boleto Bancário</li>
                </ul>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Ir para Pagamento Seguro
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Seu acesso será liberado automaticamente após a confirmação do pagamento
              </p>
            </CardContent>
          </Card>
        )}

        {/* Suporte */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground">
              📞 Precisa de ajuda? Entre em contato:<br />
              <a href="mailto:comercial@fcmtech.com.br" className="text-primary hover:underline">comercial@fcmtech.com.br</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
