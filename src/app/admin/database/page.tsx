
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Database, Upload, Trash2, Search, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MOCK_CREDENTIALS, MOCK_PLATFORMS } from '@/lib/mock-data';
import { ExternalAccountCredential } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DatabaseManagement() {
  const [credentials, setCredentials] = useState<ExternalAccountCredential[]>(MOCK_CREDENTIALS);
  const [bulkInput, setBulkInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('kwify');

  const handleBulkImport = () => {
    if (!bulkInput.trim()) return;

    try {
      // Exemplo de linha: email:senha | CURSO DA CONTA: = [Curso A, Curso B] | Config By: = @user
      const lines = bulkInput.split('\n');
      const newEntries: ExternalAccountCredential[] = [];

      lines.forEach(line => {
        if (!line.includes('|')) return;

        const parts = line.split('|');
        const accessIdentifier = parts[0].trim();
        
        // Extraindo cursos: CURSO DA CONTA: = [C1, C2]
        let coursesStr = '';
        if (parts[1]) {
          const match = parts[1].match(/\[(.*?)\]/);
          if (match) coursesStr = match[1];
        }
        const providedCourseTitles = coursesStr.split(',').map(c => c.trim()).filter(c => c !== '');
        
        const adminNotes = parts[2] ? parts[2].trim() : '';

        newEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          externalPlatformId: selectedPlatform,
          accessIdentifier,
          providedCourseTitles,
          adminNotes
        });
      });

      setCredentials([...credentials, ...newEntries]);
      setBulkInput('');
      toast({ title: "Importação concluída!", description: `${newEntries.length} contas adicionadas.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro na importação", description: "Verifique o formato das linhas." });
    }
  };

  const handleDelete = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    toast({ title: "Removido", description: "Conta removida da base." });
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold">Base de Dados</h1>
              <p className="text-muted-foreground">Gerencie as credenciais de acesso externo.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Import Section */}
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
                      {MOCK_PLATFORMS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
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
                <div className="p-3 bg-secondary/50 rounded-lg text-[10px] text-muted-foreground flex gap-2">
                   <Info className="w-3 h-3 shrink-0" />
                   O sistema vai extrair os nomes dos cursos entre colchetes para vincular à busca.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contas Cadastradas</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar email..." className="pl-8 h-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
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
                    {credentials.map((cred) => (
                      <TableRow key={cred.id}>
                        <TableCell className="pl-6 font-mono text-xs">{cred.accessIdentifier}</TableCell>
                        <TableCell className="capitalize">{cred.externalPlatformId}</TableCell>
                        <TableCell>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                            {cred.providedCourseTitles.length}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(cred.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
