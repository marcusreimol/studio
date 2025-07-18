
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertTriangle, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { analyzeServiceDescription } from "@/ai/flows/safety-analyzer";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, addDoc, collection, serverTimestamp, doc } from "@/lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";

const demandFormSchema = z.object({
  title: z.string().min(10, { message: "O título deve ter pelo menos 10 caracteres." }),
  category: z.string({ required_error: "Por favor, selecione uma categoria." }),
  description: z.string().min(30, { message: "A descrição deve ter pelo menos 30 caracteres." }),
});

type DemandFormValues = z.infer<typeof demandFormSchema>;

export default function NewDemandPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [safetyConcerns, setSafetyConcerns] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const [user] = useAuthState(auth);
  const userDocRef = user ? doc(db, "users", user.uid) : null;
  const [profile] = useDocumentData(userDocRef);


  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleAnalyzeDescription = async () => {
    const description = form.getValues("description");
    if (description.length < 30) {
      toast({
        variant: "destructive",
        title: "Descrição muito curta",
        description: "Por favor, forneça uma descrição mais detalhada para análise.",
      });
      return;
    }

    setIsAnalyzing(true);
    setSafetyConcerns([]);
    try {
      const result = await analyzeServiceDescription({ description });
      setSafetyConcerns(result.safetyConcerns);
    } catch (error) {
      console.error("AI analysis failed:", error);
       toast({
        variant: "destructive",
        title: "Erro na Análise",
        description: "Não foi possível analisar a descrição. Tente novamente.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function onSubmit(data: DemandFormValues) {
    if (!user || !profile) {
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para publicar uma demanda.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const demandsCollectionRef = collection(db, 'demands');
      await addDoc(demandsCollectionRef, {
        ...data,
        safetyConcerns,
        authorId: user.uid,
        author: profile.fullName || 'Síndico Anônimo',
        location: profile.condominioName || 'Local não definido',
        status: 'aberto',
        proposalsCount: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Demanda Publicada!",
        description: "Sua demanda foi enviada com sucesso e os prestadores serão notificados.",
      });
      router.push('/demands');
    } catch (error) {
      console.error("Error creating demand:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Publicar",
        description: "Não foi possível publicar sua demanda. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Nova Demanda de Serviço
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>
            Descartar
          </Button>
          <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || isAnalyzing}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Publicando...' : 'Publicar Demanda'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Demanda</CardTitle>
                <CardDescription>
                  Forneça detalhes claros para que os prestadores possam fazer propostas precisas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Demanda</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Manutenção do portão da garagem" {...field} disabled={isSubmitting} />
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
                         <div className="flex items-center justify-between">
                            <FormLabel>Descrição Detalhada do Serviço</FormLabel>
                             <Button type="button" variant="outline" size="sm" onClick={handleAnalyzeDescription} disabled={isAnalyzing || isSubmitting}>
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                                Analisar Segurança
                            </Button>
                         </div>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o problema ou a necessidade com o máximo de detalhes possível."
                            className="min-h-32"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {safetyConcerns.length > 0 && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Pontos de Atenção de Segurança!</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 mt-2">
                                {safetyConcerns.map((concern, index) => (
                                    <li key={index}>{concern}</li>
                                ))}
                            </ul>
                            <p className="mt-2 text-xs">Esta análise foi gerada por IA e será incluída na sua demanda.</p>
                        </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
                <CardDescription>
                  Adicione fotos ou vídeos para ilustrar melhor a sua necessidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                                </p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG ou MP4</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple disabled={isSubmitting} />
                        </Label>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Categoria do Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                                <SelectItem value="eletrica">Elétrica</SelectItem>
                                <SelectItem value="seguranca">Segurança</SelectItem>
                                <SelectItem value="pintura">Pintura</SelectItem>
                                <SelectItem value="limpeza">Limpeza</SelectItem>
                                <SelectItem value="jardinagem">Jardinagem</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Publicação</CardTitle>
                    <CardDescription>
                        Sua identidade permanecerá anônima até que você a revele para um prestador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button type="submit" className="w-full" disabled={isSubmitting || isAnalyzing}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publicar Demanda
                    </Button>
                </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
