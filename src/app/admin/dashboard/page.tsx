
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, LayoutDashboard, BookOpen, Users, DollarSign, LogOut } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [courses, setCourses] = useState(MOCK_COURSES);

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast({ title: "Curso removido", description: "O curso foi excluído com sucesso." });
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Sidebar Nav */}
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
            <Link href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Vendas</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Financeiro</span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="font-headline text-3xl font-bold">Visão Geral</h1>
              <Link href="/admin/courses/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 px-6">
                  <Plus className="w-5 h-5" /> Novo Curso
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cursos Ativos</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{courses.length}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total de Vendas</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">124</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 42.150,00</div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-background border-b px-6 py-4">
                <CardTitle className="font-headline text-xl">Gerenciamento de Cursos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      <TableHead className="w-[100px] pl-6">Capa</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Pontos Chave</TableHead>
                      <TableHead className="text-right pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="pl-6 py-4">
                          <div className="relative w-16 h-12 rounded overflow-hidden">
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell className="font-bold text-primary">R$ {course.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {course.learningPoints.slice(0, 2).map((p, i) => (
                              <span key={i} className="text-[10px] bg-secondary px-1 rounded">{p}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(course.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
