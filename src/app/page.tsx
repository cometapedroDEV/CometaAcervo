
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold text-primary">Curso<span className="text-foreground">Digital</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">Cursos</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">Sobre</Link>
          </nav>
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
                Domine novas <span className="text-primary">habilidades</span> com os melhores cursos.
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Aprenda com especialistas do mercado, de qualquer lugar e no seu próprio ritmo. Transforme sua carreira hoje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full">
                    Explorar Cursos
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-2 text-lg px-8 py-6 rounded-full">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block aspect-square">
               <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-6"></div>
               <Image 
                src="https://picsum.photos/seed/edu/1200/600"
                alt="Learning illustration"
                fill
                className="object-cover rounded-3xl shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500"
                data-ai-hint="education learning"
               />
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
                <h3 className="font-headline text-xl font-bold">Acesso Vitalício</h3>
                <p className="text-muted-foreground text-sm">Uma vez comprado, o curso é seu para sempre. Revise as aulas quando quiser.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl font-bold">Suporte Direto</h3>
                <p className="text-muted-foreground text-sm">Tire suas dúvidas diretamente com os instrutores e comunidade de alunos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Course Catalog Preview */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="space-y-4">
                <h2 className="font-headline text-4xl font-bold">Cursos em <span className="text-primary">Destaque</span></h2>
                <p className="text-muted-foreground max-w-xl">Os treinamentos mais procurados e bem avaliados da nossa plataforma para você começar agora.</p>
              </div>
              <Link href="/courses">
                <Button variant="link" className="text-primary font-bold text-lg group">
                  Ver todos os cursos <Search className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_COURSES.map((course) => (
                <Card key={course.id} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="font-headline text-xl mb-2">{course.title}</CardTitle>
                    <p className="text-muted-foreground text-sm line-clamp-3">{course.description}</p>
                  </CardHeader>
                  <CardContent className="px-6 pb-2">
                    <div className="flex flex-wrap gap-2">
                      {course.learningPoints.slice(0, 3).map((point, idx) => (
                        <span key={idx} className="bg-secondary px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold">
                          {point}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-4 flex items-center justify-between border-t mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Preço</span>
                      <span className="text-2xl font-bold text-primary">R$ {course.price.toFixed(2)}</span>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                        Saiba Mais
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <span className="font-headline text-2xl font-bold text-primary">Curso<span className="text-background">Digital</span></span>
              <p className="text-muted-foreground text-sm">Sua porta de entrada para o conhecimento especializado.</p>
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/courses" className="hover:text-primary">Todos os Cursos</Link></li>
                <li><Link href="/instructors" className="hover:text-primary">Instrutores</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary">Central de Ajuda</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Fale Conosco</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Termos de Uso</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold mb-4">Admin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/admin/login" className="hover:text-primary font-bold text-primary">Acesso Administrativo</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; 2024 CursoDigital. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary">Facebook</Link>
              <Link href="#" className="hover:text-primary">Instagram</Link>
              <Link href="#" className="hover:text-primary">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
