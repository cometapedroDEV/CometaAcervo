
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
  const requestsQuery = useMemoFirebase(() => collection(firestore, 'course_requests'), [firestore]);
  const { data: requests, isLoading } = useCollection(requestsQuery);

  const handleDelete = (id: string) => {
    if (!confirm("Remover este relato?")) return;
    deleteDocumentNonBlocking(doc(firestore, 'course_requests', id));
    toast({ title: "Removido", description: "Pedido de curso removido da lista." });
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
            <p className="text-muted-foreground">Veja quais cursos seus alunos estão procurando e não encontraram.</p>
          </div>
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Cursos Solicitados</CardTitle>
            <CardDescription>Estes são os termos de busca que não retornaram resultados diretos ou foram enviados via formulário.</CardDescription>
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
                  {requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="pl-6 font-bold">{req.courseName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.requestedAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(req.id)}>
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
