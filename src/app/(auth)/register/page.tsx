"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/logo";
import GoogleIcon from "@/components/google-icon";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleGoogleRegister = async () => {
        const user = await signInWithGoogle();
        if (user) {
        router.push("/dashboard");
        } else {
             toast({
                variant: "destructive",
                title: "Erro de Autenticação",
                description: "Não foi possível se cadastrar com o Google. Tente novamente.",
            });
        }
    };

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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nome Completo</Label>
              <Input id="full-name" placeholder="Seu nome" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required />
            </div>
            
            <div className="grid gap-2">
              <Label>Você é:</Label>
              <RadioGroup defaultValue="sindico" className="flex gap-4">
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

            <Button type="submit" className="w-full">
              Criar Conta
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleRegister}>
               <GoogleIcon className="mr-2 h-4 w-4" />
              Cadastrar com Google
            </Button>
          </div>
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
