
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  LogOut, 
  Search, 
  Play, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  CheckCircle, 
  Shield, 
  Globe, 
  Mail, 
  Key as KeyIcon, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function MemberAreaPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedCourse, setRequestedCourse] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [ownedCourses, setOwnedCourses] = useState<string[]>([]);
  
  // Estado para visualização de acesso
  const [viewingAccess, setViewingAccess] = useState<{
    courseTitle: string;
    email: string;
    pass: string;
    platformName: string;
    loginUrl: string;
  } | null>(null);

  // Carrega cursos já comprados do localStorage
  useEffect(() => {
    const purchased = JSON.parse(localStorage.getItem('my_purchased_courses') || '[]');
    setOwnedCourses(purchased);
  }, []);
  
  // Busca plataformas
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms } = useCollection(platformsQuery);

  // Busca cursos do catálogo
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: catalogCourses, isLoading: isCoursesLoading } = useCollection(coursesQuery);

  // Busca base de dados de acessos
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials, isLoading: isDbLoading } = useCollection(credentialsQuery);
  
  // Lógica de busca combinada
  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    // 1. Cursos do catálogo
    const catalogMatches = catalogCourses?.map(c => {
      const platform = platforms?.find(p => p.id === c.externalPlatformId);
      return {
        ...c,
        thumbnail: platform?.imageUrl || c.thumbnail || `https://picsum.photos/seed/${c.title}/600/400`,
        platformName: platform?.name || 'Plataforma Externa',
        platformImageUrl: platform?.imageUrl || '',
        isFromDatabase: false
      };
    }).filter(c => 
      !term || 
      c.title?.toLowerCase().includes(term) || 
      c.description?.toLowerCase().includes(term)
    ) || [];

    // 2. Cursos virtuais baseados na base de dados
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
                id: `db-${title.replace(/\s+/g, '-').toLowerCase()}`,
                title: title,
                description: `Curso disponível via acesso ${platform?.name || 'Base Externa'}. Adquira sua credencial agora.`,
                price: 10.00,
                isFromDatabase: true,
                platformId: cred.externalPlatformId,
                platformName: platform?.name || 'Plataforma Externa',
                platformImageUrl: platform?.imageUrl || '',
                thumbnail: platform?.imageUrl || `https://picsum.photos/seed/${title}/600/400`
              });
            }
          }
        });
      });
    }

    return [...catalogMatches, ...databaseMatches];
  }, [searchTerm, catalogCourses, credentials, platforms]);

  // Lista detalhada dos cursos que o usuário já possui
  const myPurchasedCoursesList = useMemo(() => {
    if (!ownedCourses.length) return [];
    
    return ownedCourses.map(cid => {
      // Tenta achar no catálogo
      let course = catalogCourses?.find(c => c.id === cid);
      if (course) {
        const platform = platforms?.find(p => p.id === course.externalPlatformId);
        return {
          id: cid,
          title: course.title,
          platformName: platform?.name || 'Plataforma',
          platformImageUrl: platform?.imageUrl || '',
          thumbnail: platform?.imageUrl || `https://picsum.photos/seed/${course.title}/600/400`
        };
      }
      
      // Se for virtual da DB, tenta reconstruir as infos
      // O ID virtual é db-nome-do-curso
      if (cid.startsWith('db-')) {
        const titleFromId = cid.replace('db-', '').replace(/-/g, ' ');
        // Procura na DB qual plataforma tem esse curso
        const cred = credentials?.find(c => 
          c.providedCourseTitles?.some((t: string) => t.toLowerCase().includes(titleFromId.toLowerCase()))
        );
        const platform = platforms?.find(p => p.id === cred?.externalPlatformId);
        return {
          id: cid,
          title: titleFromId,
          platformName: platform?.name || 'Plataforma',
          platformImageUrl: platform?.imageUrl || '',
          thumbnail: platform?.imageUrl || `https://picsum.photos/seed/${cid}/600/400`
        };
      }

      return {
        id: cid,
        title: "Curso Adquirido",
        platformName: "Acessar",
        platformImageUrl: "",
        thumbnail: "https://picsum.photos/seed/course/600/400"
      };
    });
  }, [ownedCourses, catalogCourses, credentials, platforms]);

  const handleRequestCourse = () => {
    if (!requestedCourse.trim()) return;
    setIsSendingRequest(true);

    addDocumentNonBlocking(collection(firestore, 'course_requests'), {
      courseName: requestedCourse.trim(),
      requestedAt: new Date().toISOString()
    });

    setRequestedCourse('');
    setShowThanks(true);
    setIsSendingRequest(false);
    
    setTimeout(() => {
      setShowThanks(false);
    }, 10000);
  };

  const handleConfirmPurchase = (course: any) => {
    setIsRedirecting(true);
    const url = new URL(window.location.origin + `/checkout/${course.id}`);
    url.searchParams.set('title', course.title);
    url.searchParams.set('platform', course.platformName);
    url.searchParams.set('platformImage', course.platformImageUrl || '');
    router.push(url.pathname + url.search);
  };

  const handleShowAccess = (courseTitle: string) => {
    if (!credentials) {
      toast({ title: "Aguarde", description: "Carregando base de dados..." });
      return;
    }

    const normalizedTitle = courseTitle.toLowerCase().trim();

    // Procura credencial que tenha o curso
    const cred = credentials.find(c => 
      c.providedCourseTitles?.some((title: string) => {
        const t = title.toLowerCase().trim();
        return t === normalizedTitle || normalizedTitle.includes(t) || t.includes(normalizedTitle);
      })
    );

    if (cred) {
      const platform = platforms?.find(p => p.id === cred.externalPlatformId);
      const [email, pass] = cred.accessIdentifier.split(':');
      setViewingAccess({
        courseTitle,
        email: email?.trim() || 'N/A',
        pass: pass?.trim() || 'N/A',
        platformName: platform?.name || 'Plataforma',
        loginUrl: platform?.loginUrl || ''
      });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Dados de acesso não encontrados para este curso. Entre em contato com o suporte." 
      });
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      <header className="bg-foreground text-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-background">Acervo</span></Link>
          <div className="flex items-center gap-6">
             <Link href="/"><LogOut className="w-5 h-5 text-primary cursor-pointer" /></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold text-foreground">Sua Área de Membros</h1>
            <p className="text-muted-foreground">Aqui estão seus cursos e o acervo completo para explorar.</p>
          </div>

          <Tabs defaultValue="catalog" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="purchased" className="font-bold">Meus Cursos</TabsTrigger>
              <TabsTrigger value="catalog" className="font-bold">Explorar Acervo (R$ 10,00)</TabsTrigger>
            </TabsList>

            <TabsContent value="purchased" className="space-y-6">
              {myPurchasedCoursesList.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPurchasedCoursesList.map((c) => (
                    <Card key={c.id} className="border-none shadow-xl overflow-hidden bg-background">
                      <div className="relative h-40">
                        <Image src={c.thumbnail || `https://picsum.photos/seed/${c.id}/600/400`} alt={c.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 text-white font-bold text-sm flex items-center gap-2">
                           <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/30">
                              <Image src={c.platformImageUrl || `https://picsum.photos/seed/${c.platformName}/24/24`} alt={c.platformName} fill className="object-cover" />
                           </div>
                           {c.platformName}
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="font-headline text-lg text-foreground leading-tight uppercase">{c.title}</CardTitle>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 gap-2 rounded-xl"
                          onClick={() => handleShowAccess(c.title)}
                        >
                           <Play className="w-4 h-4 fill-current" /> Ver Acesso
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
                  className="pl-12 h-14 rounded-full border-primary/20 shadow-xl text-lg bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-w-2xl mx-auto">
                <Card className="border-primary/20 bg-primary/5 shadow-sm border-2">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="text-sm font-bold flex items-center justify-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" /> Não encontrou o curso? Peça agora:
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showThanks ? (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Digite o nome do curso aqui..." 
                          className="flex-grow bg-background h-10"
                          value={requestedCourse}
                          onChange={(e) => setRequestedCourse(e.target.value)}
                        />
                        <Button onClick={handleRequestCourse} disabled={isSendingRequest || !requestedCourse} className="gap-2">
                          <Send className="w-4 h-4" /> Enviar
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-2 space-y-2 animate-in fade-in zoom-in">
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                          <CheckCircle className="w-5 h-5" /> Interesse enviado!
                        </div>
                        <p className="text-xs text-muted-foreground">Volte em 24h para verificar.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {(isCoursesLoading || isDbLoading) && searchTerm === '' ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Carregando acervo...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((course) => {
                    const isOwned = ownedCourses.includes(course.id);

                    return (
                      <Card key={course.id} className="border-none shadow-md overflow-hidden group">
                        <div className="relative h-44 bg-muted">
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute top-3 right-3 bg-foreground text-primary-foreground font-black px-3 py-1 rounded-full text-sm">
                            R$ {course.price?.toFixed(2) || '10,00'}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            Disponível via {course.platformName}
                          </div>
                        </div>
                        <CardHeader className="p-5">
                          <CardTitle className="font-headline text-xl leading-tight uppercase">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </CardContent>
                        <CardFooter className="p-5 pt-0">
                          {isOwned ? (
                            <Button 
                              variant="outline" 
                              className="w-full bg-green-50 border-green-200 text-green-600 font-bold h-11 gap-2"
                              onClick={() => handleShowAccess(course.title)}
                            >
                              <Play className="w-4 h-4" /> Ver Acesso
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 gap-2 shadow-lg shadow-primary/10">
                                  <CreditCard className="w-4 h-4" /> Adquirir Acesso
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border-none">
                                <AlertDialogHeader className="space-y-4">
                                  <AlertDialogTitle className="font-headline text-2xl text-center">Confirmar seu Acesso</AlertDialogTitle>
                                  <AlertDialogDescription className="text-center space-y-4">
                                    <div className="bg-secondary/50 p-6 rounded-2xl space-y-4">
                                      <div className="flex justify-between items-center text-foreground font-bold">
                                        <span>Curso:</span>
                                        <span className="text-right max-w-[200px]">{course.title}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-foreground font-bold">
                                        <span>Plataforma:</span>
                                        <div className="flex items-center gap-2">
                                          <div className="relative w-8 h-8 rounded-full overflow-hidden border bg-background">
                                            <Image src={course.platformImageUrl || `https://picsum.photos/seed/${course.platformName}/32/32`} alt={course.platformName} fill className="object-cover" />
                                          </div>
                                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                                            {course.platformName}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center text-foreground text-lg border-t border-dashed pt-3 mt-3 font-black">
                                        <span>Total:</span>
                                        <span className="text-primary">R$ {course.price?.toFixed(2) || '10.00'}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs">Você será levado ao pagamento via Pix Seguro.</p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="sm:flex-col gap-3 mt-4">
                                  <AlertDialogAction className="w-full h-12 bg-primary font-bold text-lg rounded-xl" onClick={() => handleConfirmPurchase(course)}>
                                    {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Pagar"}
                                  </AlertDialogAction>
                                  <AlertDialogCancel className="w-full h-12 rounded-xl border-none hover:bg-secondary">Cancelar</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed border-muted space-y-4">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-bold">Nenhum curso encontrado</h3>
                  <p className="text-muted-foreground">Tente outro termo ou peça o curso acima.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Diálogo de Visualização de Acesso */}
      <Dialog open={!!viewingAccess} onOpenChange={(open) => !open && setViewingAccess(null)}>
        <DialogContent className="rounded-3xl border-none max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <Shield className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-black">Dados de Acesso</DialogTitle>
            <DialogDescription className="font-medium">
              Curso: <span className="text-foreground font-bold">{viewingAccess?.courseTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div 
              className="p-4 bg-secondary/30 rounded-2xl space-y-2 cursor-pointer hover:bg-secondary/50 transition-colors group relative"
              onClick={() => handleCopy(viewingAccess?.email || '', 'E-mail')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                  <Mail className="w-3 h-3" /> E-mail de Acesso
                </div>
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-mono text-lg font-bold select-all break-all pr-8">
                {viewingAccess?.email}
              </div>
            </div>
            
            <div 
              className="p-4 bg-secondary/30 rounded-2xl space-y-2 cursor-pointer hover:bg-secondary/50 transition-colors group relative"
              onClick={() => handleCopy(viewingAccess?.pass || '', 'Senha')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                  <KeyIcon className="w-3 h-3" /> Senha
                </div>
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-mono text-lg font-bold select-all break-all pr-8">
                {viewingAccess?.pass}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            {viewingAccess?.loginUrl ? (
              <Link href={viewingAccess.loginUrl} target="_blank" className="w-full">
                <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-black gap-2 shadow-lg">
                  <ExternalLink className="w-5 h-5" /> Fazer Login na {viewingAccess.platformName}
                </Button>
              </Link>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl flex items-center gap-3 text-amber-800 text-sm font-medium border border-amber-200">
                <Globe className="w-5 h-5" /> 
                Acesse o site oficial da {viewingAccess?.platformName} para entrar.
              </div>
            )}
            <Button variant="ghost" onClick={() => setViewingAccess(null)} className="w-full font-bold">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
