"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, LogOut, Search, Play, CreditCard, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function MemberAreaPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Busca plataformas para pegar as fotos
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms } = useCollection(platformsQuery);

  // Busca cursos do catálogo
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: catalogCourses, isLoading: isCoursesLoading } = useCollection(coursesQuery);

  // Busca base de dados de acessos
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials, isLoading: isDbLoading } = useCollection(credentialsQuery);
  
  // Simulando cursos comprados pelo usuário
  const purchasedCourses: any[] = [];
  
  // Lógica de busca combinada
  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    // 1. Cursos do catálogo
    const catalogMatches = catalogCourses?.map(c => {
      // Tenta encontrar a foto da plataforma associada
      const platform = platforms?.find(p => p.id === c.externalPlatformId);
      return {
        ...c,
        // A foto da plataforma (base) tem precedência se existir
        thumbnail: platform?.imageUrl || c.thumbnail || `https://picsum.photos/seed/${c.title}/600/400`,
        platformName: platform?.name
      };
    }).filter(c => 
      !term || 
      c.title?.toLowerCase().includes(term) || 
      c.description?.toLowerCase().includes(term)
    ) || [];

    // 2. Cursos virtuais baseados na base de dados (apenas se houver termo de busca)
    const databaseMatches: any[] = [];
    
    if (term && credentials) {
      credentials.forEach(cred => {
        cred.providedCourseTitles?.forEach((title: string) => {
          if (title.toLowerCase().includes(term)) {
            const alreadyInCatalog = catalogMatches.some(c => c.title?.toLowerCase() === title.toLowerCase());
            const alreadyInMatches = databaseMatches.some(c => c.title?.toLowerCase() === title.toLowerCase());
            
            if (!alreadyInCatalog && !alreadyInMatches) {
              const platform = platforms?.find(p => p.id === cred.externalPlatformId);
              databaseMatches.push({
                id: `db-${Math.random()}`,
                title: title,
                description: `Curso disponível via acesso ${platform?.name || cred.externalPlatformId?.toUpperCase()}. Adquira sua credencial agora.`,
                price: 10.00,
                isFromDatabase: true,
                platformId: cred.externalPlatformId,
                platformName: platform?.name,
                thumbnail: platform?.imageUrl || `https://picsum.photos/seed/${title}/600/400`
              });
            }
          }
        });
      });
    }

    return [...catalogMatches, ...databaseMatches];
  }, [searchTerm, catalogCourses, credentials, platforms]);

  const checkAvailability = (courseTitle: string) => {
    if (!credentials) return { available: false };

    const cred = credentials.find(c => 
      c.providedCourseTitles?.some((title: string) => 
        title.toLowerCase().trim() === courseTitle.toLowerCase().trim() ||
        courseTitle.toLowerCase().includes(title.toLowerCase().trim()) ||
        title.toLowerCase().trim().includes(courseTitle.toLowerCase().trim())
      )
    );

    if (cred) {
      const platform = platforms?.find(p => p.id === cred.externalPlatformId);
      return { available: true, platform: platform?.name || cred.externalPlatformId || 'Plataforma Externa' };
    }
    return { available: false };
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <header className="bg-foreground text-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-background">Acervo</span></Link>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-background">Usuário</span>
                <span className="text-xs text-muted-foreground">Área do Aluno</span>
             </div>
             <Link href="/"><LogOut className="w-5 h-5 text-primary cursor-pointer" /></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold text-foreground">Sua Área de Membros</h1>
            <p className="text-muted-foreground">Pesquise por qualquer curso. Se estiver na nossa base, você terá acesso!</p>
          </div>

          <Tabs defaultValue="catalog" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="purchased" className="font-bold">Meus Cursos</TabsTrigger>
              <TabsTrigger value="catalog" className="font-bold">Explorar Acervo (R$ 10,00)</TabsTrigger>
            </TabsList>

            <TabsContent value="purchased" className="space-y-6">
              {purchasedCourses.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedCourses.map((course) => (
                    <Card key={course.id} className="border-none shadow-xl overflow-hidden hover:scale-[1.02] transition-transform">
                      <div className="relative h-40">
                        <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <CardHeader className="p-4">
                        {/* Removido line-clamp-1 para exibir nome completo */}
                        <CardTitle className="font-headline text-lg text-foreground">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Aulas disponíveis</div>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                           <div className="bg-primary h-full w-[100%]"></div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 gap-2">
                           <Play className="w-4 h-4 fill-current" /> Começar Estudo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed border-muted space-y-4">
                   <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                   <h3 className="text-xl font-bold">Você ainda não adquiriu nenhum curso</h3>
                   <p className="text-muted-foreground">Explore o catálogo e comece a aprender por apenas R$ 10,00!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="space-y-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-4 w-6 h-6 text-muted-foreground" />
                <Input 
                  placeholder="Qual curso você está procurando hoje?" 
                  className="pl-12 h-14 rounded-full border-primary/20 shadow-xl text-lg text-foreground bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {(isCoursesLoading || isDbLoading) && searchTerm === '' ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Carregando acervo...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((course) => {
                    const status = checkAvailability(course.title);
                    return (
                      <Card key={course.id} className="border-none shadow-md overflow-hidden group">
                        <div className="relative h-44 bg-muted">
                          <Image 
                            src={course.thumbnail} 
                            alt={course.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute top-3 right-3 bg-foreground text-primary-foreground font-black px-3 py-1 rounded-full text-sm">
                            R$ {course.price?.toFixed(2) || '10,00'}
                          </div>
                        </div>
                        <CardHeader className="p-5">
                          {/* Removido line-clamp-1 para que o nome não fique cortado */}
                          <CardTitle className="font-headline text-xl text-foreground">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 space-y-4">
                          {status.available ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Temos acesso via {status.platform}!
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-xs font-bold">
                              <AlertCircle className="w-4 h-4" /> Verificando disponibilidade...
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </CardContent>
                        <CardFooter className="p-5 pt-0">
                          <Link href={course.isFromDatabase ? "#" : `/courses/${course.id}`} className="w-full">
                            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold h-11 gap-2">
                              <CreditCard className="w-4 h-4" /> Adquirir Acesso
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed border-muted space-y-4">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-bold">Nenhum curso encontrado</h3>
                  <p className="text-muted-foreground">Tente buscar por outro termo ou verifique se o curso está na base.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
