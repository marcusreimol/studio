import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Handshake, Leaf } from 'lucide-react';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">SustentaZONA</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
           <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary opacity-80"></div>
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-foreground">
              Conectando Condomínios e Fornecedores
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-body">
              A plataforma para síndicos e prestadores de serviço na Zona Sul do Rio de Janeiro e Maricá. Publique demandas, receba propostas e promova a sustentabilidade.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/register">Sou Síndico</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Sou Prestador</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center font-headline">Funcionalidades Principais</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed text-center mt-4 font-body">
              Tudo que você precisa para uma gestão de serviços eficiente e responsável.
            </p>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12">
              <FeatureCard
                icon={<Building className="h-8 w-8 text-accent" />}
                title="Demandas Anônimas"
                description="Síndicos podem publicar demandas de serviço com total privacidade e segurança."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-accent" />}
                title="Propostas Direcionadas"
                description="Prestadores de serviço qualificados recebem notificações e enviam propostas."
              />
              <FeatureCard
                icon={<Handshake className="h-8 w-8 text-accent" />}
                title="Negociação Segura"
                description="Revele sua identidade apenas para os fornecedores escolhidos e negocie com confiança."
              />
               <FeatureCard
                icon={<Leaf className="h-8 w-8 text-accent" />}
                title="Campanhas de Sustentabilidade"
                description="Participe e crie campanhas de arrecadação para projetos sustentáveis no seu condomínio."
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Pronto para transformar a gestão do seu condomínio?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                Junte-se à nossa comunidade e comece a aproveitar os benefícios hoje mesmo.
              </p>
            </div>
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/register">Comece Agora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SustentaZONA. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <Link className="text-sm text-muted-foreground hover:text-foreground" href="#">
              Termos de Serviço
            </Link>
             <Link className="text-sm text-muted-foreground hover:text-foreground" href="#">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold font-headline">{title}</h3>
      <p className="mt-2 text-muted-foreground font-body">{description}</p>
    </div>
  );
}
