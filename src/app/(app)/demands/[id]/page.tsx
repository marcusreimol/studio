
"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { demands } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, MessageSquare, Tag, Hand, Send, Star, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';

type Proposal = {
  id: string;
  message: string;
  value: number;
  providerReputation: number;
};

export default function DemandDetailPage({ params }: { params: { id: string } }) {
  const demand = demands.find((d) => d.id === params.id);
  const { toast } = useToast();

  const [user] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile] = useDocumentData(userDocRef);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalValue, setProposalValue] = useState("");

  if (!demand) {
    notFound();
  }
  
  const isProvider = profile?.userType === 'prestador';

  const handleProposalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newProposal: Proposal = {
        id: `prop_${Date.now()}`,
        message: proposalMessage,
        value: parseFloat(proposalValue),
        providerReputation: Math.round((4 + Math.random()) * 10) / 10, // Simulate reputation
    };
    
    setProposals(prev => [...prev, newProposal]);
    setProposalMessage("");
    setProposalValue("");

    toast({
        title: "Proposta Enviada!",
        description: "Sua proposta foi enviada anonimamente para o síndico. Você será notificado se for selecionado.",
    });
  }

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
            <Badge variant="outline">{demand.category}</Badge>
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
                    {demand.safetyConcerns.length > 0 ? (
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                           {demand.safetyConcerns.map((concern, index) => (
                                <li key={index}>{concern}</li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">Nenhum ponto de atenção de segurança foi identificado pela IA.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        {isProvider && (
            <Card>
                <CardHeader>
                    <CardTitle>Enviar Cotação Anônima</CardTitle>
                    <CardDescription>
                        Sua identidade permanecerá anônima. O síndico verá apenas sua proposta e sua reputação na plataforma.
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
                            />
                        </div>
                        <Button type="submit" className="w-full md:w-auto">
                           <Send className="mr-2 h-4 w-4" />
                            Enviar Proposta
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
        
        {!isProvider && (
             <Card>
                <CardHeader>
                    <CardTitle>Propostas Recebidas</CardTitle>
                    <CardDescription>
                        Abaixo estão as cotações anônimas recebidas para esta demanda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {proposals.length > 0 ? (
                        <div className="space-y-4">
                            {proposals.map((proposal) => (
                                <Card key={proposal.id} className="bg-secondary/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </CardTitle>
                                                <div className="flex items-center gap-1 text-sm text-amber-600 font-semibold mt-1">
                                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                    <span>{proposal.providerReputation.toFixed(1)} de Reputação</span>
                                                </div>
                                            </div>
                                            <Button size="sm">
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Contratar
                                            </Button>
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
        )}
    </div>
  );
}
