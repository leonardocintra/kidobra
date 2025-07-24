import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EbooksPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Meus eBooks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A lista de eBooks criados por você aparecerá aqui. Esta funcionalidade será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
