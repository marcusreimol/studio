import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, Users } from "lucide-react";

export default function AnalyticsPage() {
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
                    <CardTitle>Visão Geral</CardTitle>
                    <CardDescription>Mais dados e gráficos aparecerão aqui em breve.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 bg-secondary rounded-b-lg">
                    <p className="text-muted-foreground">Em desenvolvimento...</p>
                </CardContent>
           </Card>
      </div>
    </div>
  );
}
