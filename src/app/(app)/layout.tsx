
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import {
  Bell,
  Home,
  Users,
  LineChart,
  Package2,
  Briefcase,
  HeartHandshake,
  UserCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import Logo from "@/components/logo";
import AppHeader from "@/components/app-header";
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, profileLoading] = useDocumentData(userDocRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const isActive = (path: string) => pathname.startsWith(path) && (path !== '/dashboard' || pathname === '/dashboard');
  
  if (loading || profileLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
             <Logo className="h-12 w-12 text-primary animate-pulse" />
             <p className="text-muted-foreground">Carregando...</p>
          </div>
       </div>
    )
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-headline text-foreground">sindi.club</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive={isActive('/dashboard')} asChild>
                <Link href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton href="/demands" isActive={isActive('/demands')} asChild>
                  <Link href="/demands">
                      <Briefcase />
                      <span>Demandas</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton href="/campaigns" isActive={isActive('/campaigns')} asChild>
                <Link href="/campaigns">
                    <HeartHandshake />
                    <span>Campanhas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/providers" isActive={isActive('/providers')} asChild>
                <Link href="/providers">
                    <Users />
                    <span>Fornecedores</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="/analytics" isActive={isActive('/analytics')} asChild>
                <Link href="/analytics">
                    <LineChart />
                    <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/profile" isActive={isActive('/profile')}>
                        <UserCircle />
                        <span>Meu Perfil</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
