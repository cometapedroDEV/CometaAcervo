
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MessageSquare, Trash2, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function AdminRequests() {
  const firestore = useFirestore();

  // Busca real de pedidos do banco
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'course_requests');
  }, [firestore]);
  
  const { data: requests, isLoading } = useCollection(requestsQuery);

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja remover este relato?")) return;
    
    // Cria a referência do documento para exclusão
    const docRef = doc(firestore, 'course_requests', id);
    
    // Chama a função de exclusão não-bloqueante
    deleteDocumentNonBlocking(docRef);
    
    toast({ 
      title: "Relato Removido", 
      description: "O pedido de curso foi excluído com sucesso." 
    });
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold">Relatos de Interesse</h1>
            <p className="text-muted-foreground">Acompanhe os cursos que seus alunos estão solicitando.</p>
          </div>
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Cursos Solicitados</CardTitle>
            <CardDescription>Estes são os termos enviados pelos alunos na Área de Membros.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando relatos...
              </div>
            ) : requests && requests.length > 0 ? (
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="pl-6">Curso Solicitado</TableHead>
                    <TableHead>Data da Solicitação</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...requests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="pl-6 font-bold">{req.courseName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {req.requestedAt ? new Date(req.requestedAt).toLocaleString('pt-BR') : 'Data não disponível'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:text-destructive hover:bg-destructive/10 transition-colors" 
                          onClick={() => handleDelete(req.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-12 text-muted-foreground bg-background">
                Nenhum relato encontrado até o momento.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
