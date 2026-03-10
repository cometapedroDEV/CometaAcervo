"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Database, Upload, Trash2, Search, Info, Loader2, AlertCircle } from 'lucide-react';
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
  const platformsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'external_platforms');
  }, [firestore]);
  const { data: platforms } = useCollection(platformsQuery);

  // Busca credenciais reais do banco para checagem de duplicatas
  const credentialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'external_account_credentials');
  }, [firestore]);
  const { data: credentials, isLoading } = useCollection(credentialsQuery);

  // Função auxiliar para normalizar a lista de cursos e comparar conjuntos
  const getCourseFingerprint = (courses: string[]) => {
    return courses.map(c => c.toLowerCase().trim()).sort().join('|');
  };

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;
    if (!selectedPlatform) {
      toast({ variant: "destructive", title: "Erro", description: "Selecione uma plataforma de origem." });
      return;
    }

    if (!credentials) {
      toast({ variant: "destructive", title: "Erro", description: "Aguarde o carregamento da base atual." });
      return;
    }

    try {
      const lines = bulkInput.split('\n').filter(line => line.trim() !== '');
      let addedCount = 0;
      let duplicateAccessCount = 0;
      let duplicateCoursesCount = 0;
      let ignoredNoCoursesCount = 0;

      const existingFingerprints = new Set(credentials.map(c => getCourseFingerprint(c.providedCourseTitles || [])));
      const existingAccessIds = new Set(credentials.map(c => c.accessIdentifier.toLowerCase().trim()));

      lines.forEach(line => {
        const parts = line.split('|');
        const accessIdentifier = parts[0].trim();
        const accessIdLower = accessIdentifier.toLowerCase().trim();
        
        let coursesStr = '';
        if (parts[1]) {
          let courseContent = parts[1].split('=')[1] || parts[1];
          courseContent = courseContent.trim();
          
          if (courseContent.startsWith('[') && courseContent.endsWith(']')) {
            courseContent = courseContent.substring(1, courseContent.length - 1);
          }
          coursesStr = courseContent;
        }

        const providedCourseTitles = coursesStr.split(',').map(c => c.trim()).filter(c => c !== '');

        if (providedCourseTitles.length === 0) {
          ignoredNoCoursesCount++;
          return;
        }

        if (existingAccessIds.has(accessIdLower)) {
          duplicateAccessCount++;
          return;
        }

        const fingerprint = getCourseFingerprint(providedCourseTitles);
        if (existingFingerprints.has(fingerprint)) {
          duplicateCoursesCount++;
          return;
        }

        const adminNotes = parts[2] ? parts[2].trim() : '';

        const newCred = {
          externalPlatformId: selectedPlatform,
          accessIdentifier,
          providedCourseTitles,
          adminNotes,
          createdAt: new Date().toISOString()
        };

        addDocumentNonBlocking(collection(firestore, 'external_account_credentials'), newCred);
        
        existingAccessIds.add(accessIdLower);
        existingFingerprints.add(fingerprint);
        addedCount++;
      });

      setBulkInput('');
      
      let feedbackMsg = `${addedCount} contas novas adicionadas.`;
      if (duplicateAccessCount > 0) feedbackMsg += ` ${duplicateAccessCount} acessos repetidos ignorados.`;
      if (duplicateCoursesCount > 0) feedbackMsg += ` ${duplicateCoursesCount} conteúdos idênticos ignorados.`;
      if (ignoredNoCoursesCount > 0) feedbackMsg += ` ${ignoredNoCoursesCount} linhas sem cursos ignoradas.`;

      if (addedCount > 0) {
        toast({ title: "Importação Concluída!", description: feedbackMsg });
      } else {
        toast({ 
          variant: "destructive",
          title: "Nenhuma conta nova", 
          description: "As contas enviadas já existem ou não possuíam cursos válidos."
        });
      }

    } catch (err) {
      toast({ variant: "destructive", title: "Erro na importação", description: "Verifique o formato das linhas." });
    }
  };

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm("Tem certeza que deseja remover esta conta da base permanentemente?")) {
      const docRef = doc(firestore, 'external_account_credentials', id);
      deleteDocumentNonBlocking(docRef);
      
      toast({ 
        title: "Removido", 
        description: "Conta removida da base de dados com sucesso." 
      });
    }
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
                <CardTitle className="text-lg">Importação Inteligente</CardTitle>
                <CardDescription>
                  Filtra automaticamente acessos repetidos ou sem cursos.
                </CardDescription>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Dados (Linha por linha)</label>
                  <Textarea 
                    placeholder="email:senha | CURSO DA CONTA: = [Curso A, Curso B]"
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
                            <TableCell className="capitalize">{platform?.name || 'Base Desconhecida'}</TableCell>
                            <TableCell>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                                {cred.providedCourseTitles?.length || 0}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover:text-destructive hover:bg-destructive/10 transition-colors" 
                                onClick={() => handleDelete(cred.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center p-12 text-muted-foreground">
                            Nenhuma conta encontrada na base.
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
