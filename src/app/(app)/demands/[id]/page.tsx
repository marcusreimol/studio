
"use client";

import { useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, Hand, Send, Star, UserCheck, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, db, collection, doc, addDoc, serverTimestamp, query, orderBy, updateDoc, increment } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

type Proposal = {
  id?: string;
  message: string;
  value: number;
  providerReputation: number;
  createdAt: any;
  providerId: string;
  providerName: string;
  providerLogo?: string;
};

export default function DemandDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const router = useRouter();

  const [user, loadingUser] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loadingProfile] = useDocumentData(userDocRef);

  const demandDocRef = id ? doc(db, 'demands', id) : null;
  const [demand, loadingDemand, demandError] = useDocumentData(demandDocRef, { idField: 'id'});

  const proposalsCollectionRef = id ? collection(db, `demands/${id}/proposals`) : null;
  const proposalsQuery = proposalsCollectionRef ? query(proposalsCollectionRef, orderBy("createdAt", "desc")) : null;
  const [proposals, loadingProposals, proposalsError] = useCollectionData(proposalsQuery, { idField: 'id' });

  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalValue, setProposalValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHiring, setIsHiring] = useState(false);


  const handleProposalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !id || !proposalsCollectionRef || !demandDocRef || !profile) return;
    
    setIsSubmitting(true);
    try {
        await addDoc(proposalsCollectionRef, {
            message: proposalMessage,
            value: parseFloat(proposalValue),
            providerReputation: (profile?.rating || 4.5), // Use profile rating or a default
            providerId: user.uid,
            providerName: profile?.companyName || profile?.fullName,
            providerLogo: profile?.logoUrl || null,
            createdAt: serverTimestamp(),
        });
        
        await updateDoc(demandDocRef, {
            proposalsCount: increment(1)
        });
        
        setProposalMessage("");
        setProposalValue("");

        toast({
            title: "Proposta Enviada!",
            description: "Sua proposta foi enviada para o responsável pela demanda.",
        });
    } catch (error) {
        console.error("Error submitting proposal:", error);
        toast({
            variant: "destructive",
            title: "Erro!",
            description: "Não foi possível enviar sua proposta. Tente novamente.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleHire = async (proposal: Proposal) => {
    if (!demandDocRef) return;
    setIsHiring(true);
    try {
      await updateDoc(demandDocRef, {
        status: 'contratado',
        hiredProviderId: proposal.providerId,
        hiredProviderName: proposal.providerName,
        hiredValue: proposal.value,
        hiredAt: serverTimestamp(),
      });
      toast({
        title: "Fornecedor Contratado!",
        description: `Você contratou ${proposal.providerName} para este serviço.`,
      });
      // Optionally, you can add further logic like sending notifications
    } catch (error) {
      console.error("Error hiring provider:", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não foi possível contratar o fornecedor. Tente novamente.",
      });
    } finally {
      setIsHiring(false);
    }
  };

  const loading = loadingUser || loadingProfile || loadingDemand;

  if (loading) {
      return (
          <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-6">
               <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7 rounded-sm" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                     <Skeleton className="h-6 w-20" />
               </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    </Card>
                </div>
                 <div className="mt-4"><Skeleton className="h-48 w-full" /></div>
          </div>
      )
  }
  
  if (!demand || demandError) {
    notFound();
  }
  
  const isDemandCreator = user?.uid === demand.authorId;
  const isDemandOpen = demand.status === 'aberto';
  const isProvider = profile?.userType === 'prestador';

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                <Link href="/demands">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar para Demandas</span>
                </Link>
            </Button>
            <div className="flex-1">
                <h1 className="font-semibold text-xl md:text-2xl font-headline">{demand.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{demand.author}</span>
                    <span className="text-xs">&bull;</span>
                    <span>{demand.location}</span>
                </div>
            </div>
            <Badge variant={isDemandOpen ? "outline" : "default"} className={!isDemandOpen ? "bg-green-600 text-white" : ""}>
              {demand.status === 'contratado' ? 'Contratado' : demand.status}
            </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Descrição do Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{demand.description}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        <span>Pontos de Atenção de Segurança</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {demand.safetyConcerns && demand.safetyConcerns.length > 0 ? (
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                           {demand.safetyConcerns.map((concern: string, index: number) => (
                                <li key={index}>{concern}</li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">Nenhum ponto de atenção de segurança foi identificado pela IA.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        
        {isDemandOpen && isProvider && (
            <Card>
                <CardHeader>
                    <CardTitle>Enviar Cotação</CardTitle>
                    <CardDescription>
                        Sua proposta será enviada para o responsável pela demanda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProposalSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="proposal-message">Sua Proposta</Label>
                                <Textarea
                                id="proposal-message"
                                placeholder="Descreva como você resolverá o problema, materiais que serão usados, prazos, etc."
                                className="min-h-32"
                                required
                                value={proposalMessage}
                                onChange={(e) => setProposalMessage(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proposal-value">Valor da Proposta (R$)</Label>
                            <Input
                                id="proposal-value"
                                type="number"
                                placeholder="Ex: 550.00"
                                required
                                step="0.01"
                                value={proposalValue}
                                onChange={(e) => setProposalValue(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {isSubmitting ? "Enviando..." : "Enviar Proposta"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
        
        
        <Card>
            <CardHeader>
                <CardTitle>Propostas Recebidas</CardTitle>
                <CardDescription>
                    {isDemandOpen 
                        ? "Abaixo estão as cotações recebidas para esta demanda." 
                        : `Esta demanda foi contratada. Fornecedor selecionado: ${demand.hiredProviderName}.`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingProposals ? (
                        <div className="text-center text-muted-foreground p-8">Carregando propostas...</div>
                ) : proposals && proposals.length > 0 ? (
                    <div className="space-y-4">
                        {(proposals as Proposal[]).map((proposal) => (
                            <Card key={proposal.id} className={!isDemandOpen && demand.hiredProviderId !== proposal.providerId ? "opacity-50" : "bg-secondary/50"}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <Avatar>
                                                <AvatarImage src={proposal.providerLogo} />
                                                <AvatarFallback>{proposal.providerName?.charAt(0) || 'P'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-xl">
                                                    R$ {(proposal.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-semibold">{proposal.providerName}</span>
                                                    <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
                                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                        <span>{proposal.providerReputation?.toFixed(1) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isDemandCreator && isDemandOpen && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" disabled={isHiring}>
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Contratar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar Contratação</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Você tem certeza que deseja contratar <strong>{proposal.providerName}</strong> por <strong>R$ {proposal.value.toLocaleString('pt-BR')}</strong>? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleHire(proposal)}>Confirmar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        {!isDemandOpen && demand.hiredProviderId === proposal.providerId && (
                                            <Badge variant="default" className="bg-green-600 text-white">Contratado</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{proposal.message}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        <Hand className="mx-auto h-12 w-12 mb-4" />
                        <p className="font-semibold">Nenhuma proposta recebida ainda.</p>
                        <p className="text-sm">Fornecedores qualificados foram notificados e em breve enviarão suas cotações.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

    