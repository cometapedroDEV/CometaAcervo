
"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, QrCode, ArrowLeft, Loader2, CheckCircle2, Copy, Check, Lock, Globe, Mail, Key as KeyIcon, ExternalLink } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { generatePixAction, checkPixStatusAction } from '@/app/actions/payment';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const courseId = params.id as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deliveredAccess, setDeliveredAccess] = useState<{ email: string, pass: string } | null>(null);

  // Busca configurações do sistema (Token da API)
  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc(settingsRef);

  // Pega dados da query para cursos virtuais
  const queryTitle = searchParams.get('title');
  const queryPlatformImage = searchParams.get('platformImage');
  
  const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId), [firestore, courseId]);
  const { data: course, isLoading } = useDoc(courseRef);

  // Busca a plataforma se tiver id (para cursos no catálogo)
  const platformRef = useMemoFirebase(() => 
    course?.externalPlatformId ? doc(firestore, 'external_platforms', course.externalPlatformId) : null
  , [firestore, course?.externalPlatformId]);
  const { data: platform } = useDoc(platformRef);

  // Busca credenciais da base para entrega
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials } = useCollection(credentialsQuery);

  const displayTitle = course?.title || queryTitle || "Curso do Acervo";
  const displayPrice = course?.price || 10.00;
  
  // Prioriza a imagem da plataforma (foto do banco de dados) conforme solicitado
  const displayThumbnail = platform?.imageUrl || queryPlatformImage || course?.thumbnail || `https://picsum.photos/seed/${displayTitle}/100/100`;

  const handleCopyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast({ title: "Copiado!", description: "Código Pix copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deliverAccessData = useCallback(() => {
    if (!credentials) return;

    // Procura uma credencial que contenha o curso
    const cred = credentials.find(c => 
      c.providedCourseTitles?.some((title: string) => 
        title.toLowerCase().trim() === displayTitle.toLowerCase().trim() ||
        displayTitle.toLowerCase().includes(title.toLowerCase().trim()) ||
        title.toLowerCase().trim().includes(displayTitle.toLowerCase().trim())
      )
    );

    if (cred && cred.accessIdentifier) {
      const [email, pass] = cred.accessIdentifier.split(':');
      setDeliveredAccess({ email: email?.trim() || 'Aguardando...', pass: pass?.trim() || 'Verifique em Relatos' });
    } else {
      setDeliveredAccess({ email: 'Suporte Técnico', pass: 'Acesso sendo liberado' });
    }
  }, [credentials, displayTitle]);

  const startPolling = useCallback((transactionId: string) => {
    const interval = setInterval(async () => {
      if (!settings?.pushinPayToken) return;
      
      const res = await checkPixStatusAction(transactionId, settings.pushinPayToken);
      if (res.status === 'paid') {
        clearInterval(interval);
        deliverAccessData();
        setIsSuccess(true);
        toast({ title: "Pagamento Aprovado!", description: "Seu acesso foi liberado com sucesso." });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [settings?.pushinPayToken, deliverAccessData]);

  const handlePayment = async () => {
    if (!settings?.pushinPayToken) {
      toast({ variant: "destructive", title: "Erro", description: "O sistema de pagamentos ainda não foi configurado pelo administrador." });
      return;
    }

    setIsProcessing(true);
    try {
      const data = await generatePixAction(displayPrice, settings.pushinPayToken);
      setPixData({
        id: data.id,
        qr_code: data.qr_code,
        qr_code_base64: data.qr_code_base64
      });
      startPolling(data.id);
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no Pagamento", description: "Não foi possível gerar a cobrança. Tente novamente." });
    } finally {
      setIsProcessing(false);
    }
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
        <div className="max-w-2xl w-full space-y-6">
          <Card className="text-center p-8 space-y-6 border-none shadow-2xl rounded-3xl bg-background">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Pagamento Aprovado!</h1>
              <p className="text-muted-foreground">Aqui estão seus dados de acesso exclusivos.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-secondary/30 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                  <Mail className="w-3 h-3" /> E-mail de Acesso
                </div>
                <div className="font-mono text-lg font-bold truncate">{deliveredAccess?.email}</div>
              </div>
              <div className="p-4 bg-secondary/30 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                  <KeyIcon className="w-3 h-3" /> Senha
                </div>
                <div className="font-mono text-lg font-bold truncate">{deliveredAccess?.pass}</div>
              </div>
            </div>

            <div className="pt-6 border-t border-dashed">
              <p className="text-xs text-muted-foreground mb-4 font-medium">Acesse a plataforma agora para começar seus estudos:</p>
              {platform?.loginUrl ? (
                <Link href={platform.loginUrl} target="_blank">
                  <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-black gap-2 shadow-lg shadow-primary/20">
                    <ExternalLink className="w-5 h-5" /> Fazer Login na {platform.name}
                  </Button>
                </Link>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl flex items-center gap-3 text-amber-800 text-sm font-medium border border-amber-200">
                  <Globe className="w-5 h-5" /> 
                  Busque o login oficial da {platform?.name || 'plataforma'} no Google.
                </div>
              )}
            </div>

            <Button variant="ghost" onClick={() => router.push('/my-courses')} className="text-muted-foreground hover:text-primary">
              Voltar para Meus Cursos
            </Button>
          </Card>
          
          <div className="text-center space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dica Importante</p>
            <p className="text-xs text-muted-foreground px-12">Tire um print ou anote seus dados. Eles também estarão salvos na sua área de membros permanentemente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/my-courses" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Pagamento 100% Seguro
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-foreground">Finalizar Pagamento</h1>
            
            {!pixData ? (
              <Card className="p-6 border-none shadow-md space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">Pagar com Pix</span>
                    <span className="text-xs text-muted-foreground">Liberação imediata</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : `Gerar QR Code Pix`}
                </Button>
              </Card>
            ) : (
              <Card className="p-8 border-primary border-2 shadow-xl bg-background space-y-6 flex flex-col items-center text-center">
                <div className="space-y-2">
                  <h3 className="font-black text-xl">Escaneie o QR Code</h3>
                  <p className="text-xs text-muted-foreground">Abra o app do seu banco e escaneie a imagem abaixo.</p>
                </div>
                
                <div className="relative w-64 h-64 bg-white p-2 border rounded-2xl shadow-inner">
                  <img 
                    src={pixData.qr_code_base64.startsWith('data:') ? pixData.qr_code_base64 : `data:image/png;base64,${pixData.qr_code_base64}`} 
                    alt="Pix QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="w-full space-y-3">
                  <p className="text-xs font-bold text-muted-foreground">Ou use o código Copia e Cola:</p>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 gap-2 border-primary text-primary font-bold overflow-hidden"
                    onClick={handleCopyPix}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar Código Pix"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Aguardando confirmação do pagamento...
                </div>
              </Card>
            )}
            
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest px-8">
              O acesso será liberado instantaneamente após a confirmação.
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-background">
            <CardHeader className="bg-secondary/30 pb-6">
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={displayThumbnail} alt={displayTitle} className="object-cover w-full h-full" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold leading-tight">{displayTitle}</h3>
                  <span className="text-xs text-muted-foreground">Acesso Vitalício</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-xl font-black pt-3">
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
