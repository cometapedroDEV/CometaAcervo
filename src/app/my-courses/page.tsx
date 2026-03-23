
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BookOpen, LogOut, Search, Play, CreditCard, Loader2, Sparkles, Send, CheckCircle, Shield, Mail, Key as KeyIcon, ExternalLink, Copy, Wallet, Users, Share2, DollarSign } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function MemberAreaPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedCourse, setRequestedCourse] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isActivatingAffiliate, setIsActivatingAffiliate] = useState(false);
  
  const [viewingAccess, setViewingAccess] = useState<{ courseTitle: string; email: string; pass: string; platformName: string; loginUrl: string; } | null>(null);

  // User Profile for Affiliate Info
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'user_profiles', user.uid) : null, [firestore, user]);
  const { data: profile } = useDoc(userProfileRef);

  const purchasesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'purchases'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: purchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery);

  const ownedCourseIds = useMemo(() => purchases?.map(p => p.courseId) || [], [purchases]);
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms } = useCollection(platformsQuery);
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: catalogCourses, isLoading: isCoursesLoading } = useCollection(coursesQuery);
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials, isLoading: isDbLoading } = useCollection(credentialsQuery);
  
  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const catalogMatches = catalogCourses?.map(c => {
      const platform = platforms?.find(p => p.id === c.externalPlatformId);
      return { ...c, thumbnail: platform?.imageUrl || c.thumbnail, platformName: platform?.name || 'Externa', platformImageUrl: platform?.imageUrl || '', isFromDatabase: false };
    }).filter(c => !term || c.title?.toLowerCase().includes(term)) || [];

    const databaseMatches: any[] = [];
    if (term && credentials) {
      credentials.forEach(cred => {
        cred.providedCourseTitles?.forEach((title: string) => {
          if (title.toLowerCase().includes(term)) {
            if (!catalogMatches.some(c => c.title?.toLowerCase() === title.toLowerCase()) && !databaseMatches.some(c => c.title?.toLowerCase() === title.toLowerCase())) {
              const platform = platforms?.find(p => p.id === cred.externalPlatformId);
              databaseMatches.push({ id: `db-${encodeURIComponent(title)}`, title, description: `Curso via ${platform?.name}.`, price: 10.00, isFromDatabase: true, platformName: platform?.name, platformImageUrl: platform?.imageUrl, thumbnail: platform?.imageUrl });
            }
          }
        });
      });
    }
    return [...catalogMatches, ...databaseMatches];
  }, [searchTerm, catalogCourses, credentials, platforms]);

  const handleActivateAffiliate = () => {
    if (!user || !userProfileRef) return;
    setIsActivatingAffiliate(true);
    updateDocumentNonBlocking(userProfileRef, {
      isAffiliate: true,
      affiliateId: user.uid,
      walletBalance: 0
    });
    setTimeout(() => {
      setIsActivatingAffiliate(false);
      toast({ title: "Você agora é um Afiliado!", description: "Seu link de indicação já está disponível." });
    }, 500);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.uid}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copiado!", description: "Divulgue e ganhe comissões em cada venda." });
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
          <Tabs defaultValue="catalog" className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted rounded-xl gap-2">
              <TabsTrigger value="purchased" className="font-bold">Meus Cursos</TabsTrigger>
              <TabsTrigger value="catalog" className="font-bold">Explorar Acervo</TabsTrigger>
              <TabsTrigger value="affiliate" className="font-bold flex gap-2"><Users className="w-4 h-4" /> Afiliado</TabsTrigger>
              {profile?.isAffiliate && <TabsTrigger value="wallet" className="font-bold flex gap-2"><Wallet className="w-4 h-4" /> Carteira</TabsTrigger>}
            </TabsList>

            <TabsContent value="purchased" className="py-6">
              {isPurchasesLoading ? <Loader2 className="animate-spin mx-auto w-10 h-10" /> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchases?.map(p => (
                    <Card key={p.id} className="overflow-hidden">
                       <CardHeader className="p-0 h-40 relative">
                          <Image src={`https://picsum.photos/seed/${p.courseId}/600/400`} alt="" fill className="object-cover opacity-80" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                            <CardTitle className="text-white text-center uppercase text-sm">{p.courseTitle}</CardTitle>
                          </div>
                       </CardHeader>
                       <CardFooter className="p-4">
                          <Button className="w-full gap-2" onClick={() => {
                            const normalized = p.courseTitle.toLowerCase().trim();
                            const cred = credentials?.find(c => c.providedCourseTitles?.some((t: string) => t.toLowerCase().trim() === normalized));
                            if (cred) {
                              const plat = platforms?.find(pl => pl.id === cred.externalPlatformId);
                              setViewingAccess({ courseTitle: p.courseTitle, email: cred.accessIdentifier.split(':')[0], pass: cred.accessIdentifier.split(':')[1], platformName: plat?.name || 'Externa', loginUrl: plat?.loginUrl || '' });
                            } else toast({ variant: "destructive", title: "Erro no acesso" });
                          }}>
                            <Play className="w-4 h-4 fill-current" /> Ver Acesso
                          </Button>
                       </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="affiliate" className="py-6">
              <Card className="max-w-2xl mx-auto p-8 border-none shadow-xl rounded-3xl text-center space-y-6">
                {!profile?.isAffiliate ? (
                  <>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Users className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black">Torne-se um Afiliado</h2>
                    <p className="text-muted-foreground">Indique o CometaAcervo para seus amigos e ganhe uma porcentagem sobre cada venda realizada através do seu link.</p>
                    <Button className="w-full h-14 text-lg font-bold" onClick={handleActivateAffiliate} disabled={isActivatingAffiliate}>
                      {isActivatingAffiliate ? <Loader2 className="animate-spin w-6 h-6" /> : "Ativar minha conta de Afiliado"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                      <Share2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black">Seu Link de Indicação</h2>
                    <div className="p-4 bg-secondary/50 rounded-2xl border-2 border-dashed border-primary/20 break-all text-sm font-mono">
                      {window.location.origin}/register?ref={user?.uid}
                    </div>
                    <Button className="w-full h-14 gap-2 text-lg font-bold" onClick={handleCopyLink}>
                      <Copy className="w-5 h-5" /> Copiar Link de Afiliado
                    </Button>
                    <p className="text-xs text-muted-foreground italic">Dica: Divulgue esse link em grupos de WhatsApp, Facebook ou Instagram!</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="py-6">
              <div className="max-w-md mx-auto space-y-6">
                <Card className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <DollarSign className="w-40 h-40" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium opacity-80">Saldo Disponível</span>
                    <h2 className="text-5xl font-black">R$ {profile?.walletBalance?.toFixed(2) || '0,00'}</h2>
                  </div>
                  <Button variant="secondary" className="mt-8 w-full font-bold h-12" onClick={() => toast({ title: "Em breve", description: "Saques serão habilitados quando você atingir R$ 50,00." })}>
                    Solicitar Saque
                  </Button>
                </Card>
                
                <Card className="p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4" /> Histórico de Ganhos</h3>
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Suas comissões aparecerão aqui conforme as vendas forem confirmadas.
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="catalog" className="py-6 space-y-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-4 w-6 h-6 text-muted-foreground" />
                <Input placeholder="Qual curso você está procurando?" className="pl-12 h-14 rounded-full shadow-xl bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(c => {
                  const isOwned = ownedCourseIds.includes(c.id);
                  return (
                    <Card key={c.id} className="overflow-hidden flex flex-col">
                      <div className="h-44 relative bg-muted">
                        <Image src={c.thumbnail || `https://picsum.photos/seed/${c.id}/600/400`} alt="" fill className="object-cover" />
                        <div className="absolute top-2 right-2 bg-foreground text-white px-3 py-1 rounded-full text-xs font-black">R$ 10,00</div>
                      </div>
                      <CardHeader className="p-4 flex-grow"><CardTitle className="text-lg uppercase">{c.title}</CardTitle></CardHeader>
                      <CardFooter className="p-4 pt-0">
                        {isOwned ? (
                          <Button variant="outline" className="w-full gap-2 border-green-500 text-green-600">Possui Acesso</Button>
                        ) : (
                          <Button className="w-full" onClick={() => {
                            const url = new URL(window.location.origin + `/checkout/${c.id}`);
                            url.searchParams.set('title', c.title);
                            url.searchParams.set('platformImage', c.platformImageUrl || '');
                            // If user was referred, pass the ref forward
                            const currentRef = new URLSearchParams(window.location.search).get('ref');
                            if (currentRef) url.searchParams.set('ref', currentRef);
                            router.push(url.pathname + url.search);
                          }}>Comprar Acesso</Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={!!viewingAccess} onOpenChange={() => setViewingAccess(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader className="text-center space-y-4">
            <Shield className="w-12 h-12 text-green-500 mx-auto" />
            <DialogTitle className="text-2xl font-black">Seu Acesso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 bg-secondary/50 rounded-xl cursor-pointer" onClick={() => { navigator.clipboard.writeText(viewingAccess?.email || ''); toast({ title: "E-mail Copiado" }); }}>
                <div className="text-xs font-bold text-primary uppercase mb-1">E-mail</div>
                <div className="font-mono text-lg font-bold truncate">{viewingAccess?.email}</div>
             </div>
             <div className="p-4 bg-secondary/50 rounded-xl cursor-pointer" onClick={() => { navigator.clipboard.writeText(viewingAccess?.pass || ''); toast({ title: "Senha Copiada" }); }}>
                <div className="text-xs font-bold text-primary uppercase mb-1">Senha</div>
                <div className="font-mono text-lg font-bold">{viewingAccess?.pass}</div>
             </div>
          </div>
          <DialogFooter>
             {viewingAccess?.loginUrl && (
               <Link href={viewingAccess.loginUrl} target="_blank" className="w-full">
                 <Button className="w-full h-12 font-black">Login na {viewingAccess.platformName}</Button>
               </Link>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
