"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL para onde redirecionar após o login (ex: checkout)
  const callbackUrl = searchParams.get('callbackUrl');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });

      // Lógica de Redirecionamento Inteligente
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (email === 'admin@cometaacervo.com') {
        router.push('/admin/dashboard');
      } else {
        router.push('/my-courses');
      }
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Erro no Login", 
        description: "E-mail ou senha incorretos. Verifique se você já cadastrou este e-mail." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar para o início
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="font-headline text-3xl font-bold text-primary">Cometa<span className="text-foreground">Acervo</span></span>
          </div>
          <CardTitle className="font-headline text-2xl">Acesse sua conta</CardTitle>
          <CardDescription>Insira suas credenciais para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center border-t p-6">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta? <Link href="/register" className="text-primary font-bold hover:underline">Cadastre-se agora</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
