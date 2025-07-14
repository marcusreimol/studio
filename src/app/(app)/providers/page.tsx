
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { providers } from "@/lib/data";
import { Star } from "lucide-react";
import Link from "next/link";

export default function ProvidersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Fornecedores</h1>
      </div>
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
    </div>
  );
}
