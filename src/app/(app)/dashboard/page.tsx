
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Users,
} from "lucide-react";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db, collection, query, orderBy, limit, where, getDocs } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, loadingUser] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loadingProfile] = useDocumentData(userDocRef);

  const demandsQuery = query(collection(db, 'demands'), orderBy('createdAt', 'desc'), limit(5));
  const [demands, loadingDemands] = useCollectionData(demandsQuery, { idField: 'id' });

  const [stats, setStats] = useState({ proposals: 0, inProgress: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      setLoadingStats(true);
      
      const proposalsQuery = query(
        collection(db, 'demands'),
        where('authorId', '==', user.uid)
      );
      const proposalsSnapshot = await getDocs(proposalsQuery);
      let totalProposals = 0;
      for (const demandDoc of proposalsSnapshot.docs) {
        const proposalsCol = collection(db, 'demands', demandDoc.id, 'proposals');
        const proposalsDocs = await getDocs(proposalsCol);
        totalProposals += proposalsDocs.size;
      }
      
      const inProgressQuery = query(
        collection(db, 'demands'),
        where('authorId', '==', user.uid),
        where('status', '==', 'contratado')
      );
      const inProgressSnapshot = await getDocs(inProgressQuery);
      
      setStats({ proposals: totalProposals, inProgress: inProgressSnapshot.size });
      setLoadingStats(false);
    }
    if (user) {
      fetchStats();
    }
  }, [user]);

  const loading = loadingUser || loadingProfile || loadingDemands || loadingStats;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:gap-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">
              Dashboard
            </h1>
            <Button asChild>
                <Link href="/demands/new">Publicar Nova Demanda</Link>
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Link href="/demands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Demandas Ativas
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demands?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando propostas
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/demands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Propostas Recebidas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.proposals}</div>
              <p className="text-xs text-muted-foreground">
                Em todas as suas demandas
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/demands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços em Andamento</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Demandas contratadas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="grid gap-4 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>
                Demandas Recentes
              </CardTitle>
              <CardDescription>
                Últimas demandas abertas na plataforma.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/demands">
                Ver Todas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Categoria
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Propostas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demands?.map((demand:any) => (
                    <TableRow key={demand.id}>
                    <TableCell>
                        <div className="font-medium">{demand.title}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                        {demand.location}
                        </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                        {demand.category}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                        <Badge className="text-xs" variant={demand.status === 'aberto' ? 'outline' : 'default'}>
                        {demand.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{demand.proposalsCount}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
