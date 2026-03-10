
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Lógica de simulação de login
    setTimeout(() => {
      setIsLoading(false);
      // Simulação de Admin
      if (email === 'admin@cometaacervo.com' && password === 'admin') {
        toast({ title: "Sucesso!", description: "Bem-vindo ao painel administrativo." });
        router.push('/admin/dashboard');
      } else {
        // Redirecionamento para Área de Membros para usuários comuns
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso. Aproveite seus cursos!" });
        router.push('/my-courses');
      }
    }, 1000);
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
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center border-t p-6">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta? <Link href="/register" className="text-primary font-bold hover:underline">Cadastre-se agora</Link>
          </p>
          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Acesso de Demonstração</p>
            <p className="text-[10px] font-mono mt-1">Admin: admin@cometaacervo.com / admin</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
