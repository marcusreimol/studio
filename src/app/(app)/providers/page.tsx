
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

type Provider = {
    id: string;
    name: string;
    category: string;
    rating: number;
    location: string;
    logo: string;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const q = query(collection(db, "users"), where("userType", "==", "prestador"));
        const querySnapshot = await getDocs(q);
        const providersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.companyName || data.fullName || 'Nome não definido',
            category: 'Serviços Gerais', // Placeholder
            rating: 4.5, // Placeholder
            location: 'Rio de Janeiro', // Placeholder
            logo: data.logoUrl || `https://placehold.co/64x64.png`,
          };
        });
        setProviders(providersData);
      } catch (error) {
        console.error("Error fetching providers: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Fornecedores</h1>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`provider-skeleton-${i}`}>
              <CardHeader className="items-center text-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={provider.logo} alt={provider.name} data-ai-hint="company logo" />
                  <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-xl">{provider.name}</CardTitle>
                 <Badge variant="outline" className="mt-1">{provider.category}</Badge>
              </CardHeader>
              <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{provider.location}</span>
                      <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                      </div>
                  </div>
                   <Button asChild className="w-full mt-4">
                      <Link href={`/providers/${provider.id}`}>Ver Perfil</Link>
                   </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
