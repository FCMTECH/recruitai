'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SetupSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Simular processamento do webhook
    const timer = setTimeout(() => {
      setIsProcessing(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Processando Pagamento</h2>
              <p className="text-muted-foreground">
                Aguarde enquanto confirmamos seu pagamento e ativamos sua conta...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        </div>

        {/* Card de Sucesso */}
        <Card className="border-primary/20">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              🎉 Conta Configurada com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg mb-3">✅ Tudo Pronto!</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Senha criada e conta ativada</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Pagamento confirmado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Plano personalizado ativado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Acesso completo à plataforma liberado</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-center">
                <strong>Próximos Passos:</strong>
              </p>
              <ol className="mt-3 space-y-2 text-sm">
                <li>1. Faça login com seu e-mail e senha</li>
                <li>2. Complete o perfil da sua empresa</li>
                <li>3. Crie sua primeira vaga</li>
                <li>4. Convide membros da equipe</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1"
                size="lg"
              >
                <Link href="/auth/signin">
                  🔑 Fazer Login
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Link href="/">
                  🏠 Página Inicial
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">
                📜 Um e-mail de confirmação foi enviado para sua caixa de entrada.
              </p>
              <p className="text-sm text-muted-foreground">
                📞 Precisa de ajuda? <a href="mailto:comercial@fcmtech.com.br" className="text-primary hover:underline">comercial@fcmtech.com.br</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
