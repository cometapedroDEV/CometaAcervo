
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Plus, Trash2, Loader2, Image as ImageIcon, Check, Key, Users, Percent } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function AdminSettings() {
  const firestore = useFirestore();
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformImageUrl, setNewPlatformImageUrl] = useState('');
  const [newPlatformLoginUrl, setNewPlatformLoginUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Settings
  const [apiToken, setApiToken] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('20');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(firestore, 'system', 'settings'), [firestore]);
  const { data: settingsData } = useDoc(settingsRef);

  useEffect(() => {
    if (settingsData) {
      if (settingsData.pushinPayToken) setApiToken(settingsData.pushinPayToken);
      if (settingsData.affiliateCommissionPercentage) setCommissionPercent(settingsData.affiliateCommissionPercentage.toString());
    }
  }, [settingsData]);

  const platformsQuery = useMemoFirebase(() => collection(firestore, 'external_platforms'), [firestore]);
  const { data: platforms, isLoading: loadingPlatforms } = useCollection(platformsQuery);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setDocumentNonBlocking(settingsRef, { 
      pushinPayToken: apiToken,
      affiliateCommissionPercentage: parseFloat(commissionPercent)
    }, { merge: true });
    
    setTimeout(() => {
      setIsSavingSettings(false);
      toast({ title: "Configurações Salvas", description: "O sistema foi atualizado com sucesso." });
    }, 500);
  };

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    setIsAdding(true);
    addDocumentNonBlocking(collection(firestore, 'external_platforms'), {
      name: newPlatformName.trim(),
      imageUrl: newPlatformImageUrl.trim() || `https://picsum.photos/seed/${newPlatformName}/400/300`,
      loginUrl: newPlatformLoginUrl.trim(),
      createdAt: new Date().toISOString()
    });
    setNewPlatformName('');
    setNewPlatformImageUrl('');
    setNewPlatformLoginUrl('');
    setIsAdding(false);
    toast({ title: "Plataforma adicionada" });
  };

  const handleDeletePlatform = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm("Excluir esta plataforma?")) {
      deleteDocumentNonBlocking(doc(firestore, 'external_platforms', id));
      toast({ title: "Removida" });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie o ecossistema do CometaAcervo.</p>
          </div>
        </div>

        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="platforms">Plataformas</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="api">Pagamento</TabsTrigger>
            <TabsTrigger value="danger" className="text-destructive">Zona de Perigo</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Bases de Cursos</CardTitle>
                <CardDescription>Gerencie as plataformas externas, suas imagens e URLs de login.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">Nome</label>
                    <Input placeholder="Ex: Kwify" value={newPlatformName} onChange={(e) => setNewPlatformName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">URL Login</label>
                    <Input placeholder="https://..." value={newPlatformLoginUrl} onChange={(e) => setNewPlatformLoginUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold uppercase">Foto URL</label>
                    <div className="flex gap-2">
                      <Input placeholder="https://..." value={newPlatformImageUrl} onChange={(e) => setNewPlatformImageUrl(e.target.value)} className="flex-grow" />
                      <Button onClick={handleAddPlatform} disabled={isAdding} className="gap-2">
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
                      ) : platforms?.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex justify-center">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted border">
                                {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePlatform(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Sistema de Afiliados</CardTitle>
                </div>
                <CardDescription>Configure a comissão paga aos seus parceiros.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Comissão por Venda (%)
                  </label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 20" 
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Defina quanto um afiliado ganha sobre o valor da venda (R$ 10,00).</p>
                </div>
                <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Integração Pushin Pay</CardTitle>
                </div>
                <CardDescription>Token para pagamentos via Pix.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">API Token</label>
                  <Input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Obtenha seu token no painel da Pushin Pay em Configurações &gt; API.</p>
                </div>
                <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                  Salvar Token
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive/20 border-2 bg-destructive/5 shadow-md p-6">
              <p className="text-destructive font-bold mb-4">Ações irreversíveis.</p>
              <Button variant="destructive" onClick={() => { if (typeof window !== 'undefined' && window.confirm("Limpar todo o sistema?")) toast({ title: "Em breve" }); }}>Limpar Sistema</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
