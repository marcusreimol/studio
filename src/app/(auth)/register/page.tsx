
"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/logo";
import GoogleIcon from "@/components/google-icon";
import { signInWithGoogle, createUserWithEmailAndPassword, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [user, loading] = useAuthState(auth);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (user) {
        router.push("/dashboard");
        }
    }, [user, router]);


    const handleGoogleRegister = async () => {
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            // The useEffect hook will handle the redirect
        } catch(error) {
             console.error(error);
             toast({
                variant: "destructive",
                title: "Erro de Autenticação",
                description: "Ocorreu um erro inesperado. Tente novamente.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // The useEffect hook will handle the redirect
        } catch (error: any) {
            console.error(error);
             toast({
                variant: "destructive",
                title: "Erro no Cadastro",
                description: "Não foi possível criar sua conta. Verifique os dados ou tente outro e-mail.",
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
    <div className="flex items-center justify-center min-h-screen bg-secondary py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
             <Logo className="h-10 w-10 mx-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-headline">Crie sua conta</CardTitle>
          <CardDescription className="font-body">
            Comece a transformar a gestão de serviços do seu condomínio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nome Completo</Label>
              <Input 
                id="full-name" 
                placeholder="Seu nome" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                />
            </div>
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
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Você é:</Label>
              <RadioGroup defaultValue="sindico" className="flex gap-4" disabled={isLoading || isGoogleLoading}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sindico" id="r-sindico" />
                  <Label htmlFor="r-sindico" className="font-body">Síndico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prestador" id="r-prestador" />
                  <Label htmlFor="r-prestador" className="font-body">Prestador de Serviço</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleRegister} disabled={isLoading || isGoogleLoading}>
               {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
              Cadastrar com Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm font-body">
            Já possui uma conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
