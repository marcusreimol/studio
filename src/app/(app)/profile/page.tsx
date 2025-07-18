
"use client";

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db, updateDoc, doc, storage, ref, uploadBytes, getDownloadURL } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const profileSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório.'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
  linkedin: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
  facebook: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
  logoUrl: z.string().url().optional(),
  condominioName: z.string().optional(),
  about: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile, loading, error] = useDocumentData(userDocRef);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      phone: '',
      website: '',
      linkedin: '',
      facebook: '',
      logoUrl: '',
      condominioName: '',
      about: '',
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
        facebook: profile.facebook || '',
        logoUrl: profile.logoUrl || '',
        condominioName: profile.condominioName || '',
        about: profile.about || '',
      });
    }
  }, [profile, form]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `logos/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      form.setValue('logoUrl', downloadURL, { shouldDirty: true });
      await updateDoc(userDocRef!, { logoUrl: downloadURL });

      toast({
        title: 'Logo Atualizada!',
        description: 'Sua nova logo foi salva com sucesso.',
      });
    } catch (e) {
      console.error('Error uploading logo:', e);
      toast({
        variant: 'destructive',
        title: 'Erro de Upload!',
        description: 'Não foi possível salvar sua logo. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };


  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, data);
      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      form.reset(data); // Resets the form with the new values, clearing the dirty state
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
  const logoUrl = form.watch('logoUrl');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meu Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais e profissionais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <Label>Sua Foto ou Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={logoUrl} alt="Logo" />
                  <AvatarFallback><ImageIcon className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {logoUrl ? 'Trocar Imagem' : 'Enviar Imagem'}
                </Button>
                <Input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/gif"
                />
              </div>
            </div>

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
            
            <div className="space-y-2">
              <Label htmlFor="condominioName">Nome do Condomínio (se aplicável)</Label>
              <Input id="condominioName" {...form.register('condominioName')} placeholder="Ex: Edifício Sol Mar"/>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa (se aplicável)</Label>
              <Input id="companyName" {...form.register('companyName')} placeholder="Ex: Hidráulica Rápida" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="about">Sobre Você ou Sua Empresa</Label>
              <Textarea id="about" {...form.register('about')} placeholder="Descreva seus serviços, sua experiência como síndico, etc." />
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
                <p className="text-sm text-destructive">{form.formState.errors.linkedin.message}</p>
                )}
            </div>
              <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" {...form.register('facebook')} />
              {form.formState.errors.facebook && (
                <p className="text-sm text-destructive">{form.formState.errors.facebook.message}</p>
                )}
            </div>
          </div>
          
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
