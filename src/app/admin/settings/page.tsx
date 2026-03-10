
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Settings, Plus, Trash2, Loader2, AlertTriangle, RefreshCw, Image as ImageIcon, Pencil, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, getDocs } from 'firebase/firestore';

export default function AdminSettings() {
  const firestore = useFirestore();
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformImageUrl, setNewPlatformImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Estado para edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // Busca plataformas reais
  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms, isLoading: loadingPlatforms } = useCollection(platformsQuery);

  // Busca contagens para aviso
  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses } = useCollection(coursesQuery);
  const credentialsQuery = useMemoFirebase(() => collection(firestore, 'external_account_credentials'), [firestore]);
  const { data: credentials } = useCollection(credentialsQuery);

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    setIsAdding(true);
    
    addDocumentNonBlocking(collection(firestore, 'external_platforms'), {
      name: newPlatformName.trim(),
      imageUrl: newPlatformImageUrl.trim() || `https://picsum.photos/seed/${newPlatformName}/400/300`,
      createdAt: new Date().toISOString()
    });

    setNewPlatformName('');
    setNewPlatformImageUrl('');
    setIsAdding(false);
    toast({ title: "Plataforma adicionada", description: `A plataforma ${newPlatformName} já está disponível.` });
  };

  const handleDeletePlatform = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta plataforma?")) return;
    deleteDocumentNonBlocking(doc(firestore, 'external_platforms', id));
    toast({ title: "Removida", description: "Plataforma removida com sucesso." });
  };

  const handleStartEdit = (platform: any) => {
    setEditingId(platform.id);
    setEditName(platform.name);
    setEditImageUrl(platform.imageUrl || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdatePlatform = () => {
    if (!editingId || !editName.trim()) return;
    
    updateDocumentNonBlocking(doc(firestore, 'external_platforms', editingId), {
      name: editName.trim(),
      imageUrl: editImageUrl.trim()
    });

    setEditingId(null);
    toast({ title: "Atualizado", description: "Plataforma atualizada com sucesso." });
  };

  const clearCollection = async (collectionName: string) => {
    if (!confirm(`TEM CERTEZA? Isso vai apagar TODOS os registros de ${collectionName} permanentemente.`)) return;
    
    setIsClearing(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      querySnapshot.forEach((document) => {
        deleteDocumentNonBlocking(doc(firestore, collectionName, document.id));
      });
      toast({ title: "Sucesso", description: `A limpeza de ${collectionName} foi iniciada.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao limpar coleção." });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie o ecossistema do CometaAcervo.</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Gestão de Plataformas */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Plataformas de Origem (Bases)</CardTitle>
              <CardDescription>Gerencie as plataformas externas e suas imagens representativas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Plataforma</label>
                  <Input 
                    placeholder="Ex: Kwify" 
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">URL da Imagem (Foto da Base)</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      value={newPlatformImageUrl}
                      onChange={(e) => setNewPlatformImageUrl(e.target.value)}
                    />
                    <Button onClick={handleAddPlatform} disabled={isAdding} className="gap-2 shrink-0">
                      <Plus className="w-4 h-4" /> Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      <TableHead className="w-24 text-center">Foto</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPlatforms ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : platforms && platforms.length > 0 ? platforms.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex justify-center">
                            {editingId === p.id ? (
                              <Input 
                                value={editImageUrl} 
                                onChange={(e) => setEditImageUrl(e.target.value)} 
                                placeholder="URL Imagem" 
                                className="h-8 text-[10px]"
                              />
                            ) : (
                              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted border">
                                {p.imageUrl ? (
                                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingId === p.id ? (
                            <Input 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)} 
                              className="h-8 text-sm"
                            />
                          ) : (
                            <span className="font-medium">{p.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === p.id ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={handleUpdatePlatform} className="text-green-600 hover:bg-green-50">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-muted-foreground hover:bg-muted/10">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleStartEdit(p)} className="text-primary hover:bg-primary/10">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePlatform(p.id)} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhuma plataforma cadastrada.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="border-destructive/20 border-2 bg-destructive/5 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis que apagam dados em massa do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Button 
                variant="destructive" 
                className="h-16 flex flex-col gap-1 items-start px-6"
                onClick={() => clearCollection('courses')}
                disabled={isClearing}
              >
                <span className="font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Limpar Catálogo</span>
                <span className="text-[10px] opacity-80">Apagar {courses?.length || 0} cursos</span>
              </Button>

              <Button 
                variant="destructive" 
                className="h-16 flex flex-col gap-1 items-start px-6"
                onClick={() => clearCollection('external_account_credentials')}
                disabled={isClearing}
              >
                <span className="font-bold flex items-center gap-2"><Trash2 className="w-4 h-4" /> Limpar Base de Dados</span>
                <span className="text-[10px] opacity-80">Apagar {credentials?.length || 0} acessos externos</span>
              </Button>

              <Button 
                variant="destructive" 
                className="h-16 flex flex-col gap-1 items-start px-6"
                onClick={() => clearCollection('external_platforms')}
                disabled={isClearing}
              >
                <span className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Limpar Plataformas</span>
                <span className="text-[10px] opacity-80">Apagar {platforms?.length || 0} plataformas</span>
              </Button>
            </CardContent>
            <CardFooter className="bg-destructive/10 py-3">
              <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">Atenção: Use com extrema cautela. Dados apagados não podem ser recuperados.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
