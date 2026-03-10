
"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, CreditCard, QrCode, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const courseId = params.id as string;

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pega dados da query para cursos virtuais (não catalogados)
  const queryTitle = searchParams.get('title');
  const queryPlatform = searchParams.get('platform');

  // Busca o curso real (caso exista no catálogo)
  const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId), [firestore, courseId]);
  const { data: course, isLoading } = useDoc(courseRef);

  // Determina o que exibir (dados do banco ou dados da query)
  const displayTitle = course?.title || queryTitle || "Curso do Acervo";
  const displayPrice = course?.price || 10.00;
  const displayThumbnail = course?.thumbnail || `https://picsum.photos/seed/${displayTitle}/100/100`;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulação de processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast({ 
        title: "Pagamento Aprovado!", 
        description: "Seu acesso ao curso foi liberado na área de membros." 
      });
      // Após 3 segundos redireciona para meus cursos
      setTimeout(() => {
        router.push('/my-courses');
      }, 3000);
    }, 2000);
  };

  if (isLoading && !queryTitle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10 p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 border-none shadow-2xl rounded-3xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground">Sucesso!</h1>
            <p className="text-muted-foreground">Seu pagamento foi confirmado e seu curso já está disponível.</p>
          </div>
          <p className="text-sm text-primary font-bold animate-pulse">Redirecionando você em instantes...</p>
          <Button onClick={() => router.push('/my-courses')} className="w-full bg-primary font-bold">
            Ir para Meus Cursos agora
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href={courseId.startsWith('db-') ? '/my-courses' : `/courses/${courseId}`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Ambiente 100% Seguro
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Métodos de Pagamento */}
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-foreground">Como deseja pagar?</h1>
            
            <div className="grid gap-4">
              <button 
                onClick={() => setPaymentMethod('pix')}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 shadow-md' : 'border-background bg-background hover:border-muted'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Pix</span>
                    <span className="text-xs text-muted-foreground">Liberação imediata</span>
                  </div>
                </div>
                {paymentMethod === 'pix' && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>}
              </button>

              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'border-background bg-background hover:border-muted'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Cartão de Crédito</span>
                    <span className="text-xs text-muted-foreground">Em até 12x</span>
                  </div>
                </div>
                {paymentMethod === 'card' && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>}
              </button>
            </div>

            <Button 
              className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pagar R$ ${displayPrice.toFixed(2)}`}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground px-8">
              Ao clicar em pagar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>

          {/* Resumo do Pedido */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-background">
            <CardHeader className="bg-secondary/30 pb-6">
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              <CardDescription>Confira os detalhes antes de finalizar.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={displayThumbnail} alt={displayTitle} className="object-cover w-full h-full" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-foreground leading-tight">{displayTitle}</h3>
                  <span className="text-xs text-muted-foreground">Acesso Vitalício</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">R$ {displayPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descontos:</span>
                  <span className="font-medium text-green-600">- R$ 0,00</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-primary">R$ {displayPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
