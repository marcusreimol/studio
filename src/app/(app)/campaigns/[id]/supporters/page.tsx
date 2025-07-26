
"use client";

import { useEffect } from 'react';
import { redirect, useParams } from 'next/navigation';
import Logo from '@/components/logo';

export default function CampaignSupportersRedirectPage() {
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            redirect(`/campaigns/${id}`);
        } else {
            // Redirect to a general page if no ID is found
            redirect('/campaigns');
        }
    }, [id]);

    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
             <Logo className="h-12 w-12 text-primary animate-pulse" />
             <p className="text-muted-foreground">Redirecionando...</p>
          </div>
       </div>
    );
}
