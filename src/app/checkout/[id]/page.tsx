
"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, QrCode, ArrowLeft, Loader2, CheckCircle2, Copy, Check, Beaker } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { generatePixAction, checkPixStatusAction } from '@/app/actions/payment';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const courseId = params.id as string;

  // Affiliate capture
  const affiliateIdFromUrl = searchParams.get('ref');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const queryTitle = searchParams.get('title');
  const queryPlatformImage = searchParams.get('platformImage');
  
  const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId), [firestore, courseId]);
  const { data: course, isLoading: isLoadingCourse } = useDoc(courseRef);

  const platformRef = useMemoFirebase(() => 
    course?.externalPlatformId ? doc(firestore, 'external_platforms', course.externalPlatformId) : null
  , [firestore, course?.externalPlatformId]);
  const { data: platform } = useDoc(platformRef);

  const displayTitle = course?.title || queryTitle || "Curso do Acervo";
  const displayPrice = course?.price || 10.00;
  const displayThumbnail = platform?.imageUrl || queryPlatformImage || course?.thumbnail || `https://picsum.photos/seed/${displayTitle}/100/100`;

  useEffect(() => {
    if (!isUserLoading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isUserLoading, router]);

  const registerPurchase = useCallback(async () => {
    if (!user) return;
    
    let commission = 0;
    const affiliateId = affiliateIdFromUrl;

    if (affiliateId && settings?.affiliateCommissionPercentage) {
      commission = (displayPrice * settings.affiliateCommissionPercentage) / 100;
      
      // Update affiliate's wallet
      const affiliateProfileRef = doc(firestore, 'user_profiles', affiliateId);
      const affiliateSnap = await getDoc(affiliateProfileRef);
      if (affiliateSnap.exists()) {
        const currentBalance = affiliateSnap.data().walletBalance || 0;
        updateDocumentNonBlocking(affiliateProfileRef, {
          walletBalance: currentBalance + commission
        });
      }
    }

    addDocumentNonBlocking(collection(firestore, 'purchases'), {
      userId: user.uid,
      courseId: courseId,
      courseTitle: displayTitle,
      purchasedAt: new Date().toISOString(),
      affiliateId: affiliateId || null,
      commissionAmount: commission || 0
    });
  }, [firestore, user, courseId, displayTitle, affiliateIdFromUrl, settings, displayPrice]);

  const handlePayment = async () => {
    if (isUserLoading || !user) return;
    if (!settings?.pushinPayToken) {
      toast({ variant: "destructive", title: "Sistema Indisponível" });
      return;
    }
    setIsProcessing(true);
    try {
      const data = await generatePixAction(displayPrice, settings.pushinPayToken);
      setPixData({ id: data.id, qr_code: data.qr_code, qr_code_base64: data.qr_code_base64 });
      
      const interval = setInterval(async () => {
        const res = await checkPixStatusAction(data.id, settings.pushinPayToken);
        if (res.status === 'paid') {
          clearInterval(interval);
          await registerPurchase();
          setIsSuccess(true);
        }
      }, 5000);
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no Pagamento" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!user) return;
    await registerPurchase();
    setIsSuccess(true);
    toast({ title: "SIMULAÇÃO: Pago!" });
  };

  if (isUserLoading || (isLoadingCourse && !queryTitle)) {
    return <div className="min-h-screen flex items-center justify-center bg-secondary/10"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10 p-4">
        <Card className="text-center p-8 space-y-6 max-w-md w-full rounded-3xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-black">Obrigado!</h1>
          <p className="text-muted-foreground">Seu pagamento foi aprovado. O curso já está na aba <b>Meus Cursos</b>.</p>
          <Link href="/my-courses"><Button className="w-full h-12">Ir para Meus Cursos</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/my-courses" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Finalizar Pagamento</h1>
            {!pixData ? (
              <Button className="w-full h-14 text-lg font-bold" onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pagar com Pix (R$ ${displayPrice.toFixed(2)})`}
              </Button>
            ) : (
              <Card className="p-8 space-y-6 text-center">
                <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="Pix" className="mx-auto w-64 h-64 border rounded-xl" />
                <Button variant="outline" className="w-full h-12 gap-2" onClick={() => { navigator.clipboard.writeText(pixData.qr_code); setCopied(true); toast({ title: "Copiado!" }); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar Código Pix
                </Button>
                <Button variant="ghost" className="text-[10px] w-full" onClick={handleSimulateSuccess}><Beaker className="w-3 h-3 mr-1" /> Teste: Simular Pagamento</Button>
              </Card>
            )}
          </div>
          <Card className="p-8 rounded-3xl h-fit">
            <h3 className="font-bold mb-4">Resumo</h3>
            <div className="flex gap-4 items-center">
              <img src={displayThumbnail} className="w-16 h-16 rounded-lg object-cover" />
              <div className="text-sm font-bold uppercase">{displayTitle}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
