
"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';

type CampaignData = {
    title: string;
};

type SupporterData = {
    id: string;
    amount: number;
    providerName: string;
    providerLogo: string;
};

export default function CampaignSupportersPage() {
    const params = useParams();
    const id = params.id as string;
    
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [supporters, setSupporters] = useState<SupporterData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchCampaignAndSupporters = async () => {
            setLoading(true);
            try {
                // Fetch campaign details
                const campaignDocRef = doc(db, 'campaigns', id);
                const campaignSnap = await getDoc(campaignDocRef);

                if (!campaignSnap.exists()) {
                    notFound();
                    return;
                }
                setCampaign(campaignSnap.data() as CampaignData);

                // Fetch supporters
                const supportersCollectionRef = collection(db, `campaigns/${id}/supporters`);
                const supportersQuery = query(supportersCollectionRef);
                const supportersSnapshot = await getDocs(supportersQuery);
                
                const supportersData = await Promise.all(
                    supportersSnapshot.docs.map(async (supporterDoc) => {
                        const supporter = supporterDoc.data();
                        
                        // Fetch provider details
                        const providerDocRef = doc(db, 'users', supporter.providerId);
                        const providerSnap = await getDoc(providerDocRef);
                        const providerData = providerSnap.data();

                        return {
                            id: supporterDoc.id,
                            amount: supporter.amount,
                            providerName: providerData?.companyName || providerData?.fullName || 'Apoiador Anônimo',
                            providerLogo: providerData?.logoUrl || `https://placehold.co/40x40.png`,
                        };
                    })
                );
                
                setSupporters(supportersData);

            } catch (error) {
                console.error("Error fetching campaign supporters: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignAndSupporters();
    }, [id]);

    if (loading) {
        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-7 w-7 rounded-sm" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    if (!campaign) {
        // This case will be handled by notFound() inside useEffect, but as a fallback:
        return <p>Campanha não encontrada.</p>
    }

    const totalAmount = supporters.reduce((acc, supporter) => acc + supporter.amount, 0);
    const totalSupporters = supporters.length;

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
                            {supporters.map((supporter) => (
                                <TableRow key={supporter.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={supporter.providerLogo} alt={supporter.providerName} data-ai-hint="company logo" />
                                            <AvatarFallback>{supporter.providerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{supporter.providerName}</TableCell>
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
