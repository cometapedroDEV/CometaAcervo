
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, BookOpen, Users, DollarSign, LogOut, Database, Server } from 'lucide-react';
import { MOCK_COURSES, MOCK_CREDENTIALS } from '@/lib/mock-data';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="flex h-screen">
        <aside className="w-64 bg-foreground text-background p-6 hidden md:flex flex-col">
          <div className="mb-12">
            <span className="font-headline text-2xl font-bold text-primary">Cometa<span className="text-background">Acervo</span></span>
          </div>
          <nav className="flex-grow space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 bg-primary/10 text-primary rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/courses/new" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Cursos</span>
            </Link>
            <Link href="/admin/database" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Database className="w-5 h-5" />
              <span className="font-medium">Base de Dados</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Vendas</span>
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
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{MOCK_COURSES.length}</div></CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Contas na Base</CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{MOCK_CREDENTIALS.length}</div></CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Vendas</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">124</div></CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">R$ 1.240</div></CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <Card className="border-none shadow-md">
                 <CardHeader><CardTitle className="text-lg">Ações Rápidas</CardTitle></CardHeader>
                 <CardContent className="grid gap-4">
                    <Button asChild className="w-full justify-start gap-3 h-12" variant="outline">
                      <Link href="/admin/courses/new"><BookOpen className="w-5 h-5" /> Cadastrar Novo Curso</Link>
                    </Button>
                    <Button asChild className="w-full justify-start gap-3 h-12" variant="outline">
                      <Link href="/admin/database"><Database className="w-5 h-5" /> Gerenciar Base de Dados</Link>
                    </Button>
                 </CardContent>
               </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
