"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutDashboard, Users, DollarSign, LogOut, Database, Loader2, Settings, ShoppingCart, ExternalLink } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup } from 'firebase/firestore';

export default function AdminDashboard() {
  const firestore = useFirestore();

  // Busca real de cursos
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

  // Busca real de credenciais
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials, isLoading: loadingCredentials } = useCollection(credentialsQuery);

  // Busca real de plataformas para o join das compras
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms } = useCollection(platformsQuery);

  // Busca real de perfis de usuários para o join
  const profilesQuery = useMemoFirebase(() => collection(firestore, 'user_profiles'), [firestore]);
  const { data: profiles } = useCollection(profilesQuery);

  // Busca as últimas 15 compras (usando collectionGroup para pegar de todos os usuários)
  const purchasesQuery = useMemoFirebase(() => {
    // Nota: collectionGroup pode exigir a criação de um índice no console do Firebase
    try {
      return query(collectionGroup(firestore, 'purchases'), orderBy('purchaseDate', 'desc'), limit(15));
    } catch (e) {
      // Fallback para caso o collectionGroup ainda não esteja configurado
      return null;
    }
  }, [firestore]);
  const { data: purchases, isLoading: loadingPurchases } = useCollection(purchasesQuery);

  // Cálculo de faturamento real baseado nas compras carregadas (simulando soma total)
  const totalSalesCount = purchases?.length || 0;
  const totalRevenue = purchases?.reduce((acc, p) => acc + (p.amountPaid || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="flex h-screen">
        <aside className="w-64 bg-foreground text-background p-6 hidden md:flex flex-col">
          <div className="mb-12 text-center">
            <span className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-background">Acervo</span></span>
          </div>
          <nav className="flex-grow space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 bg-primary/10 text-primary rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/database" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Database className="w-5 h-5" />
              <span className="font-medium">Base de Dados</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </Link>
          </nav>
          <div className="pt-6 border-t border-muted/10">
            <Link href="/" className="flex items-center gap-3 p-3 hover:text-primary transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="font-headline text-3xl font-bold">Visão Geral</h1>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Cursos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCourses ? <Loader2 className="w-4 h-4 animate-spin" /> : (courses?.length || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Contas na Base</CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCredentials ? <Loader2 className="w-4 h-4 animate-spin" /> : (credentials?.length || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Vendas</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalSalesCount}</div></CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Últimas Compras</CardTitle>
                  <p className="text-sm text-muted-foreground">Monitoramento das 15 vendas mais recentes do sistema.</p>
                </div>
                <ShoppingCart className="w-6 h-6 text-primary/40" />
              </CardHeader>
              <CardContent className="p-0">
                {loadingPurchases ? (
                  <div className="flex items-center justify-center p-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando vendas...
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow>
                        <TableHead className="pl-6">Data</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="pr-6">Base/Origem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases && purchases.length > 0 ? purchases.map((purchase) => {
                        const course = courses?.find(c => c.id === purchase.courseId);
                        const profile = profiles?.find(p => p.id === purchase.userProfileId);
                        const credential = credentials?.find(c => c.id === purchase.deliveredCredentialId);
                        const platform = platforms?.find(p => p.id === (credential?.externalPlatformId || course?.externalPlatformId));

                        return (
                          <TableRow key={purchase.id}>
                            <TableCell className="pl-6 text-xs text-muted-foreground">
                              {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : purchase.userProfileId.substring(0, 8)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {course?.title || 'Curso Removido'}
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              R$ {purchase.amountPaid?.toFixed(2)}
                            </TableCell>
                            <TableCell className="pr-6">
                              <span className="inline-flex items-center gap-1 bg-secondary px-2 py-1 rounded text-[10px] font-bold uppercase">
                                {platform?.name || 'Externa'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center p-12 text-muted-foreground">
                            Nenhuma venda registrada até o momento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
