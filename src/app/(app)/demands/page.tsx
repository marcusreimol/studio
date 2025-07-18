
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, doc, Query as FirestoreQuery, WhereFilterOp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { File, ListFilter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Demand = {
  id: string;
  title: string;
  category: string;
  location: string;
  author: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  proposalsCount: number;
};

export default function DemandsPage() {
  const [user, loadingUser] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loadingProfile] = useDocumentData(userDocRef);
  
  const [demandsQuery, setDemandsQuery] = useState<FirestoreQuery | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // We need to wait for both user and profile to be loaded before creating a query.
    if (!loadingUser && !loadingProfile) {
        let q;
        const demandsCollection = collection(db, 'demands');
        
        const constraints = [];
        if (profile?.userType === 'sindico' && user) {
            constraints.push(where('authorId', '==', user.uid));
        }

        if (activeTab !== 'all') {
            constraints.push(where('category', '==', activeTab));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        
        q = query(demandsCollection, ...constraints);
        setDemandsQuery(q);
    }
  }, [user, profile, loadingUser, loadingProfile, activeTab]);

  const [demands, loadingDemands, error] = useCollectionData(demandsQuery, { idField: 'id' });

  const loading = loadingUser || loadingProfile || loadingDemands || !demandsQuery;

  const formatDate = (timestamp: Demand['createdAt']) => {
    if (!timestamp || !timestamp.seconds) return 'Data indisponível';
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };
  
  const getCardTitle = () => {
    if (profile?.userType === 'sindico') {
      return "Minhas Demandas";
    }
    return "Demandas Abertas";
  };
  
  const getCardDescription = () => {
    if (profile?.userType === 'sindico') {
      return "Gerencie as demandas que você publicou para o seu condomínio.";
    }
    return "Encontre oportunidades de serviço em condomínios.";
  };

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="hidraulica">Hidráulica</TabsTrigger>
          <TabsTrigger value="eletrica">Elétrica</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="pintura">Pintura</TabsTrigger>
          <TabsTrigger value="limpeza">Limpeza</TabsTrigger>
          <TabsTrigger value="jardinagem">Jardinagem</TabsTrigger>
          <TabsTrigger value="outros">Outros</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filtrar
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Localização
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Data</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent value="all" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{getCardTitle()}</CardTitle>
            <CardDescription>
              {getCardDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demanda</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Localização
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Publicado em
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive py-8">
                        Erro ao carregar as demandas. Por favor, tente novamente mais tarde.
                      </TableCell>
                    </TableRow>
                ) : demands && demands.length > 0 ? (
                  (demands as Demand[]).map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">
                         {demand.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{demand.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {demand.location}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(demand.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/demands/${demand.id}`}>Ver Detalhes</Link>
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhuma demanda encontrada para esta categoria.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{demands?.length || 0}</strong> {demands?.length === 1 ? 'demanda' : 'demandas'}
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
