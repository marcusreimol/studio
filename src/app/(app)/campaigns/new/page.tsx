
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { auth, db, storage, collection, addDoc, serverTimestamp, ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const campaignFormSchema = z.object({
  title: z.string().min(10, { message: "O título deve ter pelo menos 10 caracteres." }),
  description: z.string().min(30, { message: "A descrição deve ter pelo menos 30 caracteres." }),
  goal: z.coerce.number().min(1, { message: "A meta deve ser de pelo menos R$ 1,00." }),
  image: z.instanceof(File).refine(file => file.size > 0, 'Por favor, envie uma imagem.'),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function NewCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: 0,
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: CampaignFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para criar uma campanha." });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload image to Firebase Storage
      const imageFile = data.image;
      const storageRef = ref(storage, `campaigns/${user.uid}/${Date.now()}_${imageFile.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadSnapshot.ref);

      // 2. Save campaign data to Firestore
      const campaignsCollectionRef = collection(db, 'campaigns');
      await addDoc(campaignsCollectionRef, {
        title: data.title,
        description: data.description,
        goal: data.goal,
        imageUrl: imageUrl,
        current: 0, // Initial amount
        creatorId: user.uid,
        creatorName: user.displayName || 'Anônimo',
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Campanha Criada!",
        description: "Sua campanha foi publicada com sucesso e já está visível para todos.",
      });

      router.push("/campaigns");

    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Criar Campanha",
        description: "Não foi possível criar sua campanha. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/campaigns">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
              Nova Campanha de Arrecadação
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('/campaigns')}>
                Descartar
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Publicando...' : 'Publicar Campanha'}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Campanha</CardTitle>
                  <CardDescription>
                    Forneça detalhes claros para que a comunidade possa entender e apoiar sua causa.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Campanha</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Horta Comunitária no Terraço" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Campanha</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o objetivo da campanha, onde os fundos serão usados, etc."
                              className="min-h-32"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Imagem da Campanha</CardTitle>
                  <CardDescription>
                    Adicione uma foto para ilustrar sua campanha e atrair mais apoiadores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => ( // Removed 'field' as we use ref and manual change handler
                      <FormItem>
                        <FormControl>
                            <div className="flex items-center justify-center w-full">
                                <Label
                                    htmlFor="dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary relative"
                                >
                                  {previewImage ? (
                                      <img src={previewImage} alt="Preview" className="object-cover w-full h-full rounded-lg" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG ou JPG</p>
                                    </div>
                                  )}
                                    <Input 
                                        id="dropzone-file" 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/png, image/jpeg"
                                        disabled={isSubmitting}
                                    />
                                </Label>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Financeira</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta (R$)</FormLabel>
                          <FormControl>
                              <Input type="number" placeholder="Ex: 1500.00" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
              <Card className="block md:hidden">
                  <CardHeader>
                      <CardTitle>Publicação</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitting ? 'Publicando...' : 'Publicar Campanha'}
                      </Button>
                  </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
