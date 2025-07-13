
"use client";

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db, updateDoc, doc } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório.'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
  linkedin: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loading, error] = useDocumentData(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      phone: '',
      website: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || '',
        companyName: profile.companyName || '',
        phone: profile.phone || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, data);
      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (e) {
      console.error('Error updating profile:', e);
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Não foi possível atualizar seu perfil. Tente novamente.',
      });
    }
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-40" />
            </CardContent>
        </Card>
    );
  }
  
  if (error) {
    return <p>Erro ao carregar o perfil.</p>
  }

  const isProvider = profile?.userType === 'prestador';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meu Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais e profissionais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" {...form.register('fullName')} />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>
            
            {isProvider && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input id="companyName" {...form.register('companyName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" {...form.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...form.register('website')} />
                   {form.formState.errors.website && (
                    <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
                    )}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" {...form.register('linkedin')} />
                  {form.formState.errors.linkedin && (
                    <p className="text-sm text-destructive">{form.form-state.errors.linkedin.message}</p>
                    )}
                </div>
              </>
            )}
          </div>
          
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
