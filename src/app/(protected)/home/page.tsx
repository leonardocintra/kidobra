import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Kidobra!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta é a página inicial. O conteúdo principal da aplicação será exibido aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
