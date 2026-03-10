
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { CheckCircle, ArrowLeft, Clock, Shield, Award, PlayCircle, Loader2, Info } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const courseId = params.id as string;

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Busca o curso real do banco
  const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId), [firestore, courseId]);
  const { data: course, isLoading: loadingCourse } = useDoc(courseRef);

  // Busca a plataforma para saber o nome
  const platformRef = useMemoFirebase(() => 
    course?.externalPlatformId ? doc(firestore, 'external_platforms', course.externalPlatformId) : null
  , [firestore, course?.externalPlatformId]);
  const { data: platform } = useDoc(platformRef);

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando detalhes do curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Curso não encontrado</h1>
          <p className="text-muted-foreground">O curso que você procura pode ter sido removido ou o link está incorreto.</p>
          <Link href="/my-courses">
            <Button className="bg-primary">Voltar para o Acervo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmPurchase = () => {
    setIsRedirecting(true);
    // Simula o tempo de redirecionamento para o checkout
    setTimeout(() => {
      router.push(`/checkout/${courseId}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-headline text-xl font-bold text-primary">Cometa<span className="text-foreground">Acervo</span></Link>
          <div className="flex gap-4">
             <Link href="/my-courses"><Button variant="ghost">Ver Acervo</Button></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-12">
            <Link href="/my-courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
            </Link>

            <div className="space-y-6">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-foreground">{course.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Acesso imediato</div>
                <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-primary" /> Multi-plataforma</div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Suporte garantido</div>
              </div>
            </div>

            {course.learningPoints && course.learningPoints.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-headline text-2xl font-bold">O que você vai aprender:</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.learningPoints.map((point: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-secondary">
               <Image src={course.thumbnail || `https://picsum.photos/seed/${courseId}/800/450`} alt={course.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                    <PlayCircle className="w-12 h-12" />
                  </div>
               </div>
            </div>
          </div>

          {/* Card de Checkout Lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-primary h-2 w-full"></div>
                <CardHeader className="p-8">
                  <div className="flex items-center gap-2 text-primary font-bold mb-2">
                    <Shield className="w-4 h-4" /> Compra 100% Segura
                  </div>
                  <CardTitle className="font-headline text-4xl font-black">R$ {course.price?.toFixed(2) || '10.00'}</CardTitle>
                </CardHeader>
                <CardContent className="px-8 space-y-6">
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-xl font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all"
                        disabled={isRedirecting}
                      >
                        {isRedirecting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Comprar Agora"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-none">
                      <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="font-headline text-2xl text-center">Confirmar seu Acesso</AlertDialogTitle>
                        <AlertDialogDescription className="text-center space-y-4">
                          <div className="bg-secondary/50 p-6 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center text-foreground">
                              <span className="font-medium">Curso:</span>
                              <span className="font-bold text-right max-w-[200px]">{course.title}</span>
                            </div>
                            <div className="flex justify-between items-center text-foreground">
                              <span className="font-medium">Plataforma:</span>
                              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{platform?.name || 'Verificando...'}</span>
                            </div>
                            <div className="flex justify-between items-center text-foreground text-lg border-t border-dashed pt-3 mt-3">
                              <span className="font-bold">Total:</span>
                              <span className="font-black text-primary">R$ {course.price?.toFixed(2) || '10.00'}</span>
                            </div>
                          </div>
                          <p className="text-xs">Ao confirmar, você será redirecionado para a nossa área de pagamento seguro.</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="sm:flex-col gap-3 mt-4">
                        <AlertDialogAction 
                          className="w-full h-12 bg-primary font-bold text-lg rounded-xl"
                          onClick={handleConfirmPurchase}
                        >
                          Confirmar e Pagar
                        </AlertDialogAction>
                        <AlertDialogCancel className="w-full h-12 rounded-xl border-none hover:bg-secondary">
                          Cancelar
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <div className="space-y-4 pt-4">
                    <p className="text-center text-sm text-muted-foreground">Formas de pagamento:</p>
                    <div className="flex justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                       <Image src="https://i.imgur.com/K9tJ5mH.png" alt="Pix" width={40} height={16} className="h-4 w-auto object-contain" />
                       <Image src="https://i.imgur.com/R3Z5tF7.png" alt="Cartão" width={40} height={16} className="h-4 w-auto object-contain" />
                    </div>
                  </div>
                </CardContent>
                <div className="bg-secondary/50 p-6 text-center text-xs text-muted-foreground">
                  Garantia de 7 dias ou seu dinheiro de volta.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
