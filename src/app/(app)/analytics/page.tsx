import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, Users, HeartHandshake, Star } from "lucide-react";
import { campaigns } from "@/lib/data";

export default function AnalyticsPage() {
    const totalCampaigns = campaigns.length;
    
    // Calculate total unique supporters
    const allSupporters = new Set();
    campaigns.forEach(campaign => {
        campaign.supporters.forEach(supporter => {
            allSupporters.add(supporter.id);
        });
    });
    const totalUniqueSupporters = allSupporters.size;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Analytics</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investido em Demandas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Demandas Concluídas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
             <p className="text-xs text-muted-foreground">
              este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Fornecedores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3</div>
            <p className="text-xs text-muted-foreground">
              desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
           <Card>
                <CardHeader>
                    <CardTitle>Visão Geral de Campanhas</CardTitle>
                    <CardDescription>Dados sobre o engajamento das campanhas de sustentabilidade.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                        <HeartHandshake className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total de Campanhas</p>
                            <p className="text-2xl font-bold">{totalCampaigns}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                        <Star className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Apoiadores Únicos</p>
                            <p className="text-2xl font-bold">{totalUniqueSupporters}</p>
                        </div>
                    </div>
                </CardContent>
           </Card>
      </div>
    </div>
  );
}
