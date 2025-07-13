import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { campaigns } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";


export default function CampaignSupportersPage({ params }: { params: { id: string } }) {
    const campaign = campaigns.find(c => c.id === params.id);

    if (!campaign) {
        notFound();
    }

    const totalSupporters = campaign.supporters.length;
    const totalAmount = campaign.supporters.reduce((acc, supporter) => acc + supporter.amount, 0);

  return (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                <Link href="/campaigns">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl font-headline">Apoiadores da Campanha</h1>
                <p className="text-muted-foreground">{campaign.title}</p>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Arrecadado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">R$ {totalAmount.toLocaleString('pt-BR')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total de Apoiadores</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totalSupporters}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Lista de Apoiadores</CardTitle>
                <CardDescription>Veja quem está ajudando a tornar esta campanha uma realidade.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Logo</TableHead>
                            <TableHead>Nome do Apoiador</TableHead>
                            <TableHead className="text-right">Valor Apoiado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaign.supporters.map((supporter) => (
                             <TableRow key={supporter.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={supporter.logo} alt={supporter.name} data-ai-hint="company logo" />
                                        <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{supporter.name}</TableCell>
                                <TableCell className="text-right font-semibold">R$ {supporter.amount.toLocaleString('pt-BR')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
