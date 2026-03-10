"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, BookOpen, Clock, LogOut, Search, Play, CreditCard } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

export default function MemberAreaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulando cursos comprados (apenas o primeiro do mock)
  const purchasedCourses = MOCK_COURSES.slice(0, 1);
  
  // Filtrando catálogo para busca
  const availableCourses = MOCK_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary/10">
      {/* User Header */}
      <header className="bg-foreground text-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl font-bold text-primary">Curso<span className="text-background">Digital</span></Link>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold">João Silva</span>
                <span className="text-xs text-muted-foreground">Área do Aluno</span>
             </div>
             <Link href="/"><LogOut className="w-5 h-5 text-primary cursor-pointer" title="Sair" /></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold">Olá, João!</h1>
            <p className="text-muted-foreground">O que vamos aprender hoje? Lembre-se: todo o catálogo por R$ 10,00.</p>
          </div>

          <Tabs defaultValue="purchased" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="purchased" className="font-bold">Meus Cursos</TabsTrigger>
              <TabsTrigger value="catalog" className="font-bold">Explorar Catálogo</TabsTrigger>
            </TabsList>

            {/* ABA: MEUS CURSOS */}
            <TabsContent value="purchased" className="space-y-6">
              {purchasedCourses.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedCourses.map((course) => (
                    <Card key={course.id} className="border-none shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                      <div className="relative h-40">
                        <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded">Disponível</span>
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="font-headline text-lg line-clamp-1">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 45 Aulas</div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 12h Restantes</div>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                           <div className="bg-primary h-full w-[35%]"></div>
                        </div>
                        <p className="text-[10px] text-right text-muted-foreground font-bold uppercase tracking-widest">35% Concluído</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 gap-2">
                          <a href={course.accessLink} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 fill-current" /> Assistir Agora
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border-2 border-dashed border-muted shadow-sm space-y-6">
                   <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                     <BookOpen className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold">Nenhum curso adquirido</h3>
                     <p className="text-muted-foreground">Explore nosso catálogo e comece a aprender agora.</p>
                   </div>
                </div>
              )}
            </TabsContent>

            {/* ABA: EXPLORAR CATÁLOGO */}
            <TabsContent value="catalog" className="space-y-6">
              <div className="relative max-w-md mx-auto mb-10">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar curso por título..." 
                  className="pl-10 h-12 rounded-full border-primary/20 shadow-sm focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <Card key={course.id} className="border-none shadow-md overflow-hidden group">
                    <div className="relative h-44">
                      <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-3 right-3 bg-foreground/90 text-primary-foreground font-black px-3 py-1 rounded-full text-sm shadow-lg">
                        R$ 10,00
                      </div>
                    </div>
                    <CardHeader className="p-5">
                      <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {course.learningPoints.slice(0, 3).map((point, idx) => (
                          <span key={idx} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                            {point}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      <Link href={`/courses/${course.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold h-11 gap-2">
                          <CreditCard className="w-4 h-4" /> Comprar Curso
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {availableCourses.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  Nenhum curso encontrado para sua busca.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
