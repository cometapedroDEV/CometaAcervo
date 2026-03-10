
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, Clock, LogOut } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

export default function MyCoursesPage() {
  // Simulating purchased courses
  const purchasedCourses = MOCK_COURSES.slice(0, 1);

  return (
    <div className="min-h-screen bg-secondary/10">
      {/* User Header */}
      <header className="bg-foreground text-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-headline text-2xl font-bold text-primary">Curso<span className="text-background">Digital</span></Link>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold">João Silva</span>
                <span className="text-xs text-muted-foreground">Aluno Premium</span>
             </div>
             <Link href="/"><LogOut className="w-5 h-5 text-primary cursor-pointer" /></Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold">Meus Cursos</h1>
            <p className="text-muted-foreground">Continue de onde você parou.</p>
          </div>

          {purchasedCourses.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-8">
              {purchasedCourses.map((course) => (
                <Card key={course.id} className="border-none shadow-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                  <div className="relative h-48">
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded">Acesso Liberado</span>
                    </div>
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="font-headline text-2xl">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 45 Aulas</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 12h Restantes</div>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                       <div className="bg-primary h-full w-[35%]"></div>
                    </div>
                    <p className="text-[10px] text-right text-muted-foreground font-bold uppercase tracking-widest">35% Concluído</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 gap-2">
                      <a href={course.accessLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" /> Acessar Plataforma
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-6">
               <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                 <BookOpen className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold">Você ainda não tem cursos</h3>
                 <p className="text-muted-foreground">Explore nosso catálogo e comece a aprender agora.</p>
               </div>
               <Link href="/">
                 <Button className="bg-primary font-bold">Explorar Catálogo</Button>
               </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
