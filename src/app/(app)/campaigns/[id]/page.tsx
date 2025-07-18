
"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, increment, serverTimestamp, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Loader2, Send } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';

type CampaignData = {
    title: string;
    description: string;
    imageUrl: string;
    goal: number;
    current: number;
};

type SupporterData = {
    id: string;
    amount: number;
    providerName: string;
    providerLogo: string;
};

export default function CampaignDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    
    const [user, loadingUser] = useAuthState(auth);
    const [supportersData, setSupportersData] = useState<SupporterData[]>([]);
    const [loadingSupporters, setLoadingSupporters] = useState(true);

    const campaignDocRef = id ? doc(db, 'campaigns', id) : null;
    const [campaign, loadingCampaign, errorCampaign] = useDocumentData(campaignDocRef);

    const supportersCollectionRef = id ? collection(db, `campaigns/${id}/supporters`) : null;
    const [supporters, loadingRawSupporters, errorSupporters] = useCollectionData(supportersCollectionRef);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportValue, setSupportValue] = useState("");

    useEffect(() => {
        const enrichSupporters = async () => {
            if (!supporters) {
                setLoadingSupporters(false);
                return;
            };
            setLoadingSupporters(true);
            
            const enrichedData = await Promise.all(
                supporters.map(async (supporter) => {
                    const providerDocRef = doc(db, 'users', supporter.providerId);
                    const providerSnap = await getDoc(providerDocRef);
                    const providerData = providerSnap.data();

                    return {
                        id: supporter.id,
                        amount: supporter.amount,
                        providerName: providerData?.companyName || providerData?.fullName || 'Apoiador Anônimo',
                        providerLogo: providerData?.logoUrl || `https://placehold.co/40x40.png`,
                    };
                })
            );
            setSupportersData(enrichedData.sort((a, b) => b.amount - a.amount));
            setLoadingSupporters(false);
        }
        enrichSupporters();
    }, [supporters]);

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id || !supportValue || !supportersCollectionRef || !campaignDocRef) return;

        setIsSubmitting(true);
        const amount = parseFloat(supportValue);

        try {
            await addDoc(supportersCollectionRef, {
                providerId: user.uid,
                amount: amount,
                createdAt: serverTimestamp(),
            });

            await updateDoc(campaignDocRef, {
                current: increment(amount)
            });

            toast({
                title: "Apoio Enviado!",
                description: "Obrigado por apoiar esta causa!",
            });
            setSupportValue("");
        } catch (error) {
            console.error("Error submitting support:", error);
            toast({
                variant: "destructive",
                title: "Erro!",
                description: "Não foi possível enviar seu apoio.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const loading = loadingUser || loadingCampaign || loadingSupporters;

    if (loading) {
        return (
            <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7 rounded-sm" />
                    <Skeleton className="h-7 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                 <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!campaign || errorCampaign) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Campanha não encontrada.</h1>
                <p className="text-muted-foreground">O link pode estar quebrado ou a campanha pode ter sido removida.</p>
                <Button asChild className="mt-4">
                    <Link href="/campaigns">Voltar para Campanhas</Link>
                </Button>
            </div>
        );
    }
    
    const progress = Math.min(((campaign.current || 0) / campaign.goal) * 100, 100);

    return (
        <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/campaigns">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
                    {campaign.title}
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader className="p-0">
                         <div className="aspect-video relative">
                            <Image
                                src={campaign.imageUrl}
                                alt={campaign.title}
                                fill
                                className="object-cover rounded-t-lg"
                                data-ai-hint="sustainable community"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <CardTitle className="mb-2">{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                    </CardContent>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Progresso da Arrecadação</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <Progress value={progress} className="h-4" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>R$ {(campaign.current || 0).toLocaleString('pt-BR')}</span>
                            <span className="text-muted-foreground">R$ {campaign.goal.toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">{supportersData.length} apoiadores até agora</p>
                    </CardContent>
                    <CardFooter>
                         <form onSubmit={handleSupportSubmit} className="w-full space-y-4">
                             <Label htmlFor="support-value" className="font-semibold">Quero Apoiar com (R$)</Label>
                             <div className="flex gap-2">
                                <Input
                                    id="support-value"
                                    type="number"
                                    placeholder="50.00"
                                    step="0.01"
                                    value={supportValue}
                                    onChange={(e) => setSupportValue(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Apoiar
                                </Button>
                             </div>
                         </form>
                    </CardFooter>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Apoiadores</CardTitle>
                    <CardDescription>Veja quem está ajudando a tornar esta campanha uma realidade.</CardDescription>
                </CardHeader>
                <CardContent>
                    {supportersData.length > 0 ? (
                        <ul className="space-y-4">
                            {supportersData.map(supporter => (
                                <li key={supporter.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={supporter.providerLogo} alt={supporter.providerName} data-ai-hint="company logo" />
                                            <AvatarFallback>{supporter.providerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{supporter.providerName}</span>
                                    </div>
                                    <span className="font-bold text-lg text-primary">
                                        R$ {supporter.amount.toLocaleString('pt-BR')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Nenhum apoio recebido ainda. Seja o primeiro!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
