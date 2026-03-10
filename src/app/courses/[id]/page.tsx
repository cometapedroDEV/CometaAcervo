
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Clock, Shield, Award, PlayCircle } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const course = MOCK_COURSES.find(c => c.id === params.id);
  const [isBuying, setIsBuying] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Curso não encontrado</h1>
          <Link href="/">
            <Button className="bg-primary">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    setIsBuying(true);
    // Simulation
    setTimeout(() => {
      setIsBuying(false);
      toast({ 
        title: "Compra Realizada!", 
        description: "Você recebeu acesso ao curso. Verifique seu e-mail ou painel." 
      });
      router.push('/my-courses');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Compact */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-headline text-xl font-bold text-primary">Curso<span className="text-foreground">Digital</span></Link>
          <div className="flex gap-4">
             <Link href="/login"><Button variant="ghost">Login</Button></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar aos cursos
            </Link>

            <div className="space-y-6">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold">{course.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 24h de conteúdo</div>
                <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-primary" /> 45 videoaulas</div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Certificado incluso</div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-headline text-2xl font-bold">O que você vai aprender:</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.learningPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-secondary">
               <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                    <PlayCircle className="w-12 h-12" />
                  </div>
               </div>
            </div>
          </div>

          {/* Checkout Side Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-primary h-2 w-full"></div>
                <CardHeader className="p-8">
                  <div className="flex items-center gap-2 text-primary font-bold mb-2">
                    <Shield className="w-4 h-4" /> Compra 100% Segura
                  </div>
                  <CardTitle className="font-headline text-4xl font-black">R$ {course.price.toFixed(2)}</CardTitle>
                </CardHeader>
                <CardContent className="px-8 space-y-6">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-xl font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all"
                    onClick={handlePurchase}
                    disabled={isBuying}
                  >
                    {isBuying ? "Processando..." : "Comprar Agora"}
                  </Button>
                  
                  <div className="space-y-4 pt-4">
                    <p className="text-center text-sm text-muted-foreground">Formas de pagamento:</p>
                    <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <div className="w-10 h-6 bg-muted rounded"></div>
                      <div className="w-10 h-6 bg-muted rounded"></div>
                      <div className="w-10 h-6 bg-muted rounded"></div>
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
