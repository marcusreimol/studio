import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { campaigns } from "@/lib/data";
import Image from "next/image";

export default function CampaignsPage() {
  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Campanhas de Sustentabilidade</h1>
            {/* Admin-only feature, but showing for UI purposes */}
            <Button>Criar Nova Campanha</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col">
                    <CardHeader>
                        <div className="aspect-video relative mb-4">
                           <Image
                            src={campaign.image}
                            alt={campaign.title}
                            fill
                            className="rounded-t-lg object-cover"
                            data-ai-hint="sustainable community"
                            />
                        </div>
                        <CardTitle className="font-headline">{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-foreground">
                                    R$ {campaign.current.toLocaleString('pt-BR')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Meta: R$ {campaign.goal.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <Progress value={(campaign.current / campaign.goal) * 100} className="h-2" />
                             <p className="text-xs text-muted-foreground mt-2">
                                Apoiado por: <span className="font-semibold text-foreground">{campaign.sponsor}</span>
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                            Quero Apoiar
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
