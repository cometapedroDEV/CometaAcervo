
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Database, LogOut, Settings, ShoppingCart, MessageSquare, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AdminDashboard() {
  const firestore = useFirestore();

  // Busca real de cursos
  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);
  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

  // Busca real de credenciais
  const credentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'external_account_credentials');
  }, [firestore]);
  const { data: credentials, isLoading: loadingCredentials } = useCollection(credentialsQuery);

  // Busca real de pedidos/relatos
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'course_requests');
  }, [firestore]);
  const { data: requests, isLoading: loadingRequests } = useCollection(requestsQuery);

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="flex h-screen">
        <aside className="w-64 bg-foreground text-background p-6 hidden md:flex flex-col">
          <div className="mb-12 text-center">
            <span className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-background">Acervo</span></span>
          </div>
          <nav className="flex-grow space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 bg-primary/10 text-primary rounded-lg transition-all">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/database" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Database className="w-5 h-5" />
              <span className="font-medium">Base de Dados</span>
            </Link>
            <Link href="/admin/requests" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Relatos</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Cursos no Catálogo</CardTitle>
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
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pedidos (Relatos)</CardTitle>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingRequests ? <Loader2 className="w-4 h-4 animate-spin" /> : (requests?.length || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md bg-primary/5 border border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">Monitoramento e Gestão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Bem-vindo ao centro de controle. Aqui você pode gerenciar os cursos disponíveis, as credenciais de acesso externas e agora acompanhar os interesses dos seus alunos através do menu <b>Relatos</b>.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/admin/database">
                    <Button className="gap-2">
                      <Database className="w-4 h-4" /> Ir para Base de Dados
                    </Button>
                  </Link>
                  <Link href="/admin/requests">
                    <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                      <MessageSquare className="w-4 h-4" /> Ver Relatos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
