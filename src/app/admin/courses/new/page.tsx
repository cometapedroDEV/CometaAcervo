
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Loader2, ListPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateCourseDescription } from '@/ai/flows/generate-course-description-flow';
import { summarizeKeyLearningPoints } from '@/ai/flows/summarize-key-learning-points-flow';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [accessLink, setAccessLink] = useState('');
  const [points, setPoints] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Curso criado!", description: "O novo curso foi adicionado com sucesso." });
    router.push('/admin/dashboard');
  };

  const handleAIDescription = async () => {
    if (!title || !points) {
      toast({ title: "Erro", description: "Preencha o título e pontos chave para usar a IA." });
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await generateCourseDescription({
        title,
        keyLearningPoints: points.split(',').map(p => p.trim()),
        existingDescription: description
      });
      setDescription(res.generatedDescription);
      toast({ title: "IA: Sucesso!", description: "Descrição gerada com inteligência artificial." });
    } catch (err) {
      toast({ title: "IA: Erro", description: "Falha ao gerar descrição." });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAISummarize = async () => {
    if (!description) {
      toast({ title: "Erro", description: "Preencha a descrição primeiro." });
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await summarizeKeyLearningPoints({ courseContent: description });
      setPoints(res.summary);
      toast({ title: "IA: Sucesso!", description: "Pontos chave extraídos da descrição." });
    } catch (err) {
      toast({ title: "IA: Erro", description: "Falha ao sumarizar conteúdo." });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold">Adicionar Novo Curso</h1>
        </div>

        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Informações Gerais</CardTitle>
              <CardDescription>Defina os detalhes principais do treinamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Curso</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Masterclass em React" required />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-primary text-primary hover:bg-primary/5"
                    onClick={handleAIDescription}
                    disabled={isGeneratingDesc}
                  >
                    {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Gerar com IA
                  </Button>
                </div>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Descreva o que os alunos vão aprender..." 
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="points">Pontos de Aprendizado (separados por vírgula)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-primary text-primary hover:bg-primary/5"
                    onClick={handleAISummarize}
                    disabled={isSummarizing}
                  >
                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ListPlus className="w-3 h-3 mr-1" />}
                    Extrair com IA
                  </Button>
                </div>
                <Input id="points" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="React, Hooks, TypeScript, Deploy..." required />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-primary">Preço e Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Valor (R$)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="297.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessLink">Link de Acesso</Label>
                  <Input id="accessLink" value={accessLink} onChange={(e) => setAccessLink(e.target.value)} placeholder="https://..." required />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg">
              Publicar Curso
            </Button>
            <Button type="button" variant="outline" className="w-full h-12" onClick={() => router.push('/admin/dashboard')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
