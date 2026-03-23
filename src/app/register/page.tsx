"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ref = searchParams.get('ref');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Senha fraca" });
      return;
    }
    
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        
        setDocumentNonBlocking(doc(firestore, 'user_profiles', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: email,
          firstName: name,
          registrationDate: new Date().toISOString(),
          isAffiliate: false,
          walletBalance: 0
        }, { merge: true });
      }

      toast({ title: "Conta Criada!" });
      
      const nextUrl = ref ? `/my-courses?ref=${ref}` : '/my-courses';
      router.push(nextUrl);
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro no Cadastro" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {ref ? "Você foi convidado! Comece sua jornada agora." : "Comece sua jornada de aprendizado hoje."}
        </p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input id="name" placeholder="Seu nome" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="exemplo@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <Button type="submit" className="w-full font-bold h-11" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Criar Minha Conta"}
        </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="font-headline text-3xl font-bold text-primary">Cometa<span className="text-foreground">Acervo</span></span>
          </div>
          <CardTitle className="font-headline text-2xl">Crie sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
            <RegisterForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center border-t p-6">
          <p className="text-sm text-muted-foreground">Já tem uma conta? <Link href="/login" className="text-primary font-bold hover:underline">Entrar</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
