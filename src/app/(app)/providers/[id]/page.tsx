
import { notFound } from "next/navigation";
import { providers } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Globe, Linkedin, Facebook, Star, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  const provider = providers.find((p) => p.id === params.id);

  if (!provider) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/providers">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Fornecedores</span>
          </Link>
        </Button>
        <h1 className="font-semibold text-xl md:text-2xl font-headline">Perfil do Fornecedor</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-6">
            <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={provider.logo} alt={provider.name} data-ai-hint="company logo" />
                <AvatarFallback className="text-3xl">{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-2xl">{provider.name}</CardTitle>
            <CardDescription className="mt-1">{provider.location}</CardDescription>
            <Badge variant="secondary" className="mt-2">{provider.category}</Badge>
             <div className="flex items-center gap-1 mt-4">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="text-xl font-bold text-foreground">{provider.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Entre em contato ou saiba mais sobre o fornecedor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {provider.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{provider.phone}</span>
                    </div>
                )}
                 {provider.website && (
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                           {provider.website}
                        </a>
                    </div>
                 )}
                 {provider.linkedin && (
                     <div className="flex items-center gap-3">
                        <Linkedin className="h-5 w-5 text-muted-foreground" />
                        <a href={provider.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            LinkedIn
                        </a>
                    </div>
                 )}
                 {provider.facebook && (
                    <div className="flex items-center gap-3">
                        <Facebook className="h-5 w-5 text-muted-foreground" />
                        <a href={provider.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            Facebook
                        </a>
                    </div>
                 )}
                
                 {!provider.phone && !provider.website && !provider.linkedin && !provider.facebook && (
                    <p className="text-sm text-muted-foreground">Nenhuma informação de contato disponível.</p>
                 )}
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Serviços Realizados</CardTitle>
                <CardDescription>Histórico de serviços prestados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground p-8">
                    <p>Nenhum serviço registrado ainda.</p>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
