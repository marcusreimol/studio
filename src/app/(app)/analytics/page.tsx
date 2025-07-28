
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, Users, HeartHandshake, Star, FileText, CheckCircle } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore";
import { auth, db } from "@/lib/firebase";
import { doc, collection, query, getDocs, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function AnalyticsPage() {
    const [user] = useAuthState(auth);
    const userDocRef = user ? doc(db, "users", user.uid) : null;
    const [profile, loadingProfile] = useDocumentData(userDocRef);

    const [campaigns, loadingCampaigns] = useCollectionData(collection(db, 'campaigns'));
    const [totalUniqueSupporters, setTotalUniqueSupporters] = useState(0);
    const [loadingSupporters, setLoadingSupporters] = useState(true);

    const [providerAnalytics, setProviderAnalytics] = useState({
        supportedCampaigns: 0,
        proposalsSent: 0,
        proposalsAccepted: 0,
    });
    const [loadingProviderAnalytics, setLoadingProviderAnalytics] = useState(true);

    useEffect(() => {
        const fetchSindicoData = async () => {
            if (!campaigns) return;
            setLoadingSupporters(true);
            const supporterIds = new Set<string>();
            await Promise.all(
                campaigns.map(async (campaign) => {
                    if (campaign && campaign.id) {
                       const supportersSnapshot = await getDocs(collection(db, `campaigns/${campaign.id}/supporters`));
                       supportersSnapshot.forEach(doc => {
                           supporterIds.add(doc.data().providerId);
                       });
                    }
                })
            );
            setTotalUniqueSupporters(supporterIds.size);
            setLoadingSupporters(false);
        };
        
        if (campaigns && profile?.userType === 'sindico') {
            fetchSindicoData();
        }
    }, [campaigns, profile]);

    useEffect(() => {
        const fetchProviderData = async () => {
            if (!user) return;
            setLoadingProviderAnalytics(true);

            // Supported Campaigns
            const campaignsQuery = query(collection(db, 'campaigns'));
            const campaignsSnapshot = await getDocs(campaignsQuery);
            let supportedCount = 0;
            for (const campaignDoc of campaignsSnapshot.docs) {
                const supportersSubCol = collection(db, 'campaigns', campaignDoc.id, 'supporters');
                const supporterQuery = query(supportersSubCol, where('providerId', '==', user.uid));
                const supporterSnapshot = await getDocs(supporterQuery);
                if (!supporterSnapshot.empty) {
                    supportedCount++;
                }
            }
            
            // Proposals Sent
            const demandsQuery = query(collection(db, 'demands'));
            const demandsSnapshot = await getDocs(demandsQuery);
            let sentCount = 0;
            for (const demandDoc of demandsSnapshot.docs) {
                const proposalsSubCol = collection(db, 'demands', demandDoc.id, 'proposals');
                const proposalQuery = query(proposalsSubCol, where('providerId', '==', user.uid));
                const proposalSnapshot = await getDocs(proposalQuery);
                sentCount += proposalSnapshot.size;
            }

            // Proposals Accepted
            const acceptedQuery = query(collection(db, 'demands'), where('hiredProviderId', '==', user.uid));
            const acceptedSnapshot = await getDocs(acceptedQuery);
            
            setProviderAnalytics({
                supportedCampaigns: supportedCount,
                proposalsSent: sentCount,
                proposalsAccepted: acceptedSnapshot.size
            });

            setLoadingProviderAnalytics(false);
        };

        if (user && profile?.userType === 'prestador') {
            fetchProviderData();
        }
    }, [user, profile]);


    const isSindico = profile?.userType === 'sindico';
    const loading = loadingProfile || (isSindico ? (loadingCampaigns || loadingSupporters) : loadingProviderAnalytics);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-9 w-48" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                 <div className="mt-8">
                     <Skeleton className="h-64" />
                </div>
            </div>
        )
    }

    const totalCampaigns = campaigns?.length || 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold md:text-3xl font-headline">
                    {isSindico ? 'Analytics do Condomínio' : 'Analytics do Fornecedor'}
                </h1>
            </div>

            {isSindico ? (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                         <Link href="/demands">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Investido (Em breve)
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">R$ 0,00</div>
                                    <p className="text-xs text-muted-foreground">
                                        Funcionalidade em desenvolvimento
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                         <Link href="/demands">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Demandas Concluídas (Em breve)
                                    </CardTitle>
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+0</div>
                                    <p className="text-xs text-muted-foreground">
                                        Funcionalidade em desenvolvimento
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/providers">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Novos Fornecedores (Em breve)
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+0</div>
                                    <p className="text-xs text-muted-foreground">
                                        Funcionalidade em desenvolvimento
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                    <div className="mt-8">
                        <Link href="/campaigns">
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
                        </Link>
                    </div>
                </>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/campaigns">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Campanhas Apoiadas</CardTitle>
                                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{providerAnalytics.supportedCampaigns}</div>
                                <p className="text-xs text-muted-foreground">
                                    Contribuições para um condomínio melhor
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/demands">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{providerAnalytics.proposalsSent}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total de propostas enviadas
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/demands">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Propostas Aceitas</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{providerAnalytics.proposalsAccepted}</div>
                                <p className="text-xs text-muted-foreground">
                                    { providerAnalytics.proposalsSent > 0 ?
                                        `Taxa de conversão de ${( (providerAnalytics.proposalsAccepted / providerAnalytics.proposalsSent) * 100).toFixed(1)}%`
                                        : 'Nenhuma proposta enviada ainda'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            )}
        </div>
    );
}
