
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import GoogleIcon from "@/components/google-icon";
import { signInWithGoogle, signInWithEmailAndPassword, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [user, loading] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle();
        // The useEffect hook will handle the redirect
    } catch (error) {
        console.error(error);
         toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: "Não foi possível fazer login com o Google. Tente novamente.",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // The useEffect hook will handle the redirect
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Erro de Login",
            description: "E-mail ou senha incorretos. Verifique e tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (loading || !isClient) {
     return (
       <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
             <Logo className="h-12 w-12 text-primary animate-pulse" />
             <p className="text-muted-foreground">Carregando...</p>
          </div>
       </div>
    )
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
             <Logo className="h-10 w-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-headline">Entrar na sua conta</CardTitle>
          <CardDescription className="font-body">
            Use seu e-mail para acessar a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline font-body"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
              Entrar com Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm font-body">
            Não tem uma conta?{" "}
            <Link href="/register" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
