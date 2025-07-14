
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, Users, HeartHandshake, Star, FileText, CheckCircle } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore";
import { auth, db } from "@/lib/firebase";
import { doc, collection, query, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const [user] = useAuthState(auth);
    const userDocRef = user ? doc(db, "users", user.uid) : null;
    const [profile, loadingProfile] = useDocumentData(userDocRef);

    const [campaigns, loadingCampaigns] = useCollectionData(collection(db, 'campaigns'));
    const [totalUniqueSupporters, setTotalUniqueSupporters] = useState(0);
    const [loadingSupporters, setLoadingSupporters] = useState(true);

    useEffect(() => {
        const fetchSupporters = async () => {
            if (!campaigns) return;
            setLoadingSupporters(true);
            const supporterPromises = campaigns.map(campaign => getDocs(collection(db, `campaigns/${campaign.id}/supporters`)));
            const supporterSnapshots = await Promise.all(supporterPromises);
            
            const allSupporters = new Set<string>();
            supporterSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allSupporters.add(doc.data().providerId);
                });
            });

            setTotalUniqueSupporters(allSupporters.size);
            setLoadingSupporters(false);
        };

        fetchSupporters();
    }, [campaigns]);


    // Mock data for provider analytics
    const providerAnalytics = {
        supportedCampaigns: 2,
        proposalsSent: 15,
        proposalsAccepted: 4,
    };

    const loading = loadingProfile || loadingCampaigns || loadingSupporters;

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

    const isSindico = profile?.userType === 'sindico';
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
                </>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{providerAnalytics.proposalsSent}</div>
                             <p className="text-xs text-muted-foreground">
                                nos últimos 30 dias
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Propostas Aceitas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{providerAnalytics.proposalsAccepted}</div>
                            <p className="text-xs text-muted-foreground">
                                Taxa de conversão de {( (providerAnalytics.proposalsAccepted / providerAnalytics.proposalsSent) * 100).toFixed(1)}%
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
