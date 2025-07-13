
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { demands } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loading] = useDocumentData(userDocRef);

  const myDemands = demands.slice(0, 2);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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

  const isSindico = profile?.userType === 'sindico';

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">
              {isSindico ? 'Dashboard do Síndico' : 'Dashboard do Fornecedor'}
            </h1>
             {isSindico && (
              <Button asChild>
                  <Link href="/demands/new">Publicar Nova Demanda</Link>
              </Button>
            )}
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Demandas Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Aguardando propostas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Propostas Recebidas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              Nas últimas 24 horas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Pintura da fachada
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>
                {isSindico ? 'Minhas Demandas Recentes' : 'Demandas Recentes'}
              </CardTitle>
              <CardDescription>
                {isSindico ? 'Demandas publicadas pelo seu condomínio.' : 'Últimas demandas abertas na plataforma.'}
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
                  <TableHead className="hidden xl:table-column">
                    Categoria
                  </TableHead>
                  <TableHead className="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Propostas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myDemands.map((demand) => (
                    <TableRow key={demand.id}>
                    <TableCell>
                        <div className="font-medium">{demand.title}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                        {demand.location}
                        </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                        {demand.category}
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                        <Badge className="text-xs" variant="outline">
                        Aberto
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{demand.proposals}</TableCell>
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
