
"use client";

import { useState, useEffect } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

type Campaign = {
    id: string;
    title: string;
    description: string;
    goal: number;
    current: number;
    imageUrl: string;
    sponsor?: string; 
};

type EnrichedCampaign = Campaign & {
    sponsorName?: string;
};

export default function CampaignsPage() {
    const campaignsCollectionRef = collection(db, 'campaigns');
    const q = query(campaignsCollectionRef, orderBy('createdAt', 'desc'));
    const [initialCampaigns, loading, error] = useCollectionData(q, { idField: 'id' });
    const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
    const [isEnriching, setIsEnriching] = useState(true);

    useEffect(() => {
        if (!initialCampaigns) return;

        const enrichCampaigns = async () => {
            setIsEnriching(true);
            const enriched = await Promise.all(
                (initialCampaigns as Campaign[]).map(async (campaign) => {
                    const supportersRef = collection(db, `campaigns/${campaign.id}/supporters`);
                    const q_supporters = query(supportersRef, orderBy('amount', 'desc'), limit(1));
                    const snapshot = await getDocs(q_supporters);
                    
                    if (snapshot.empty) {
                        return { ...campaign, sponsorName: 'Nenhum apoiador' };
                    }

                    const topSupporter = snapshot.docs[0].data();
                    const providerDocRef = doc(db, 'users', topSupporter.providerId);
                    const providerSnap = await getDoc(providerDocRef);
                    const providerData = providerSnap.data();
                    const sponsorName = providerData?.companyName || providerData?.fullName || 'Apoiador';

                    return { ...campaign, sponsorName };
                })
            );
            setCampaigns(enriched);
            setIsEnriching(false);
        };

        enrichCampaigns();
    }, [initialCampaigns]);


    const showLoadingSkeleton = loading || isEnriching;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold md:text-3xl font-headline">Campanhas de Sustentabilidade</h1>
                <Button asChild>
                    <Link href="/campaigns/new">Criar Nova Campanha</Link>
                </Button>
            </div>
            {showLoadingSkeleton ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="flex flex-col">
                            <CardHeader>
                                <div className="aspect-video relative mb-4">
                                    <Skeleton className="h-full w-full rounded-t-lg" />
                                </div>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center text-destructive p-8">
                    <p>Ocorreu um erro ao carregar as campanhas.</p>
                </div>
            ) : campaigns && campaigns.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="flex flex-col">
                            <CardHeader>
                                <div className="aspect-video relative mb-4">
                                <Image
                                    src={campaign.imageUrl || "https://placehold.co/600x400.png"}
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
                                            R$ {(campaign.current || 0).toLocaleString('pt-BR')}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Meta: R$ {campaign.goal.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <Progress value={((campaign.current || 0) / campaign.goal) * 100} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Apoiado por: <span className="font-semibold text-foreground">{campaign.sponsorName}</span>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <Link href={`/campaigns/${campaign.id}`}>
                                        Ver Detalhes
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Nenhuma campanha encontrada</h3>
                    <p>Seja o primeiro a criar uma campanha e engajar a sua comunidade!</p>
                </div>
            )}
        </div>
    );
}
