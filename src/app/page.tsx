import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-foreground">Acervo</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-secondary/30">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="font-headline text-5xl md:text-6xl font-extrabold leading-tight">
                Melhor acervo de cursos por apenas <span className="text-primary">R$ 10,00</span> qualquer curso!
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Acesso imediato a todos os treinamentos da nossa plataforma pelo preço único de dez reais. Aprenda com especialistas sem pesar no bolso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full w-full sm:w-auto">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block aspect-square">
               <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-6"></div>
               {heroImage && (
                 <Image 
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover rounded-3xl shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500"
                  data-ai-hint={heroImage.imageHint}
                 />
               )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl font-bold">Conteúdo Prático</h3>
                <p className="text-muted-foreground text-sm">Aulas direto ao ponto, focadas no que realmente importa para o seu crescimento.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl font-bold">Preço Simbólico</h3>
                <p className="text-muted-foreground text-sm">Nossa missão é democratizar o ensino. Por isso, qualquer curso custa apenas R$ 10,00.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl font-bold">Acesso Imediato</h3>
                <p className="text-muted-foreground text-sm">Compre e comece a estudar na hora. Sem burocracia e com suporte dos instrutores.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
