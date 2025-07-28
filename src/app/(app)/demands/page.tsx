
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from '@/lib/firebase';
import { auth, db } from '@/lib/firebase';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  status: string;
};

export default function DemandsPage() {
  const [user, loadingUser] = useAuthState(auth);

  const demandsCollectionRef = collection(db, 'demands');
  const demandsQuery = query(demandsCollectionRef, orderBy('createdAt', 'desc'));

  const [demands, loadingDemands, error] = useCollectionData(demandsQuery, { idField: 'id' });

  const loading = loadingUser || loadingDemands;

  const formatDate = (timestamp: Demand['createdAt']) => {
    if (!timestamp || !timestamp.seconds) return 'Data indisponível';
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">
          {loading ? <Skeleton className="h-8 w-48" /> : "Demandas de Serviço"}
        </h1>
        <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/demands/new">Publicar Demanda</Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>
             {loading ? <Skeleton className="h-5 w-80" /> : "Encontre ou gerencie oportunidades de serviço em condomínios."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demanda</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
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
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
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
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={demand.status === 'aberto' ? "outline" : "default"}>{demand.status}</Badge>
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
                      Nenhuma demanda encontrada.
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
