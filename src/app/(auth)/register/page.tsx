
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
import { createUserWithEmailAndPassword, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import GoogleIcon from "@/components/google-icon";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [userType, setUserType] = useState('sindico');
    const [isLoading, setIsLoading] = useState(false);
    const [user, loading] = useAuthState(auth);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && user) {
            router.push("/dashboard");
        }
    }, [user, router, isClient]);


    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: "Erro no Cadastro",
                description: "A senha deve ter pelo menos 6 caracteres.",
            });
            setIsLoading(false);
            return;
        }

        try {
            await createUserWithEmailAndPassword(email, password, fullName, userType);
            // The useEffect hook will handle the redirect after the auth state changes
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Não foi possível criar sua conta. Verifique os dados ou tente outro e-mail.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "A senha é muito fraca. Por favor, use pelo menos 6 caracteres.";
            }
             toast({
                variant: "destructive",
                title: "Erro no Cadastro",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }

     if (loading || !isClient || (isClient && user)) {
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Você é:</Label>
              <RadioGroup 
                defaultValue="sindico" 
                className="flex gap-4" 
                onValueChange={setUserType}
                value={userType}
                disabled={isLoading}
              >
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

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
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
