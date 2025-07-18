
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, doc, Query } from '@/lib/firebase';
import { auth, db } from '@/lib/firebase';
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const categories = {
  all: "Todas",
  hidraulica: "Hidráulica",
  eletrica: "Elétrica",
  seguranca: "Segurança",
  pintura: "Pintura",
  limpeza: "Limpeza",
  jardinagem: "Jardinagem",
  outros: "Outros"
};

type CategoryKey = keyof typeof categories;

export default function DemandsPage() {
  const [user, loadingUser] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loadingProfile] = useDocumentData(userDocRef);
  
  const [filter, setFilter] = useState<CategoryKey>('all');
  const [demandsQuery, setDemandsQuery] = useState<Query | null>(null);

  useEffect(() => {
    if (loadingUser || loadingProfile) return;

    const demandsCollection = collection(db, 'demands');
    let q: Query;

    if (profile?.userType === 'sindico' && user) {
        if (filter === 'all') {
            q = query(demandsCollection, where('authorId', '==', user.uid), orderBy('createdAt', 'desc'));
        } else {
            q = query(demandsCollection, where('authorId', '==', user.uid), where('category', '==', filter), orderBy('createdAt', 'desc'));
        }
    } else {
        if (filter === 'all') {
            q = query(demandsCollection, orderBy('createdAt', 'desc'));
        } else {
            q = query(demandsCollection, where('category', '==', filter), orderBy('createdAt', 'desc'));
        }
    }
    setDemandsQuery(q);

  }, [user, profile, loadingUser, loadingProfile, filter]);

  const [demands, loadingDemands, error] = useCollectionData(demandsQuery, { idField: 'id' });

  const loading = loadingUser || loadingProfile || loadingDemands;

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">
          {loading ? <Skeleton className="h-8 w-48" /> : getCardTitle()}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {categories[filter]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as CategoryKey)}>
              {Object.entries(categories).map(([key, value]) => (
                <DropdownMenuRadioItem key={key} value={key}>{value}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>
             {loading ? <Skeleton className="h-5 w-80" /> : getCardDescription()}
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
                      <Badge variant="outline">{categories[demand.category as CategoryKey] || demand.category}</Badge>
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
    </div>
  );
}
