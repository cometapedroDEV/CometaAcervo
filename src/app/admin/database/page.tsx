"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Database, Upload, Trash2, Search, Info, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function DatabaseManagement() {
  const firestore = useFirestore();
  const [bulkInput, setBulkInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Busca plataformas reais do banco
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms } = useCollection(platformsQuery);

  // Busca credenciais reais do banco
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials, isLoading } = useCollection(credentialsQuery);

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    if (!selectedPlatform) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione uma plataforma de origem." });
      return;
    }

    try {
      const lines = bulkInput.split('\n');
      let count = 0;

      lines.forEach(line => {
        if (!line.includes('|')) return;

        const parts = line.split('|');
        const accessIdentifier = parts[0].trim();
        
        let coursesStr = '';
        if (parts[1]) {
          const match = parts[1].match(/\[(.*?)\]/);
          if (match) coursesStr = match[1];
        }
        const providedCourseTitles = coursesStr.split(',').map(c => c.trim()).filter(c => c !== '');
        const adminNotes = parts[2] ? parts[2].trim() : '';

        const newCred = {
          externalPlatformId: selectedPlatform,
          accessIdentifier,
          providedCourseTitles,
          adminNotes,
          createdAt: new Date().toISOString()
        };

        addDocumentNonBlocking(collection(firestore, 'external_account_credentials'), newCred);
        count++;
      });

      setBulkInput('');
      toast({ title: "Importação iniciada!", description: `${count} contas estão sendo processadas.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro na importação", description: "Verifique o formato das linhas." });
    }
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'external_account_credentials', id));
    toast({ title: "Removido", description: "Conta removida da base." });
  };

  const filteredCredentials = credentials?.filter(c => 
    c.accessIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" size="sm" className="text-xs">Gerenciar Plataformas</Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold">Base de Dados</h1>
            <p className="text-muted-foreground">Gerencie as credenciais de acesso externo.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Importação em Lote</CardTitle>
                <CardDescription>Cole as linhas de acesso conforme o padrão.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Plataforma Origem</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                      {!platforms?.length && <SelectItem value="none" disabled>Nenhuma plataforma cadastrada</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Dados (Linha por linha)</label>
                  <Textarea 
                    placeholder="email:senha | CURSO DA CONTA: = [Curso A, Curso B] | Config By: @tag"
                    className="min-h-[200px] text-xs font-mono"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                </div>
                <Button className="w-full gap-2" onClick={handleBulkImport}>
                  <Upload className="w-4 h-4" /> Processar e Importar
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contas na Base ({filteredCredentials.length})</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar email..." 
                    className="pl-8 h-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando base...
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow>
                        <TableHead className="pl-6">Acesso</TableHead>
                        <TableHead>Plataforma</TableHead>
                        <TableHead>Qtd. Cursos</TableHead>
                        <TableHead className="text-right pr-6">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCredentials.length > 0 ? filteredCredentials.map((cred) => {
                        const platform = platforms?.find(p => p.id === cred.externalPlatformId);
                        return (
                          <TableRow key={cred.id}>
                            <TableCell className="pl-6 font-mono text-xs">{cred.accessIdentifier}</TableCell>
                            <TableCell className="capitalize">{platform?.name || cred.externalPlatformId}</TableCell>
                            <TableCell>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                                {cred.providedCourseTitles?.length || 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(cred.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center p-12 text-muted-foreground">
                            Nenhuma conta encontrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
