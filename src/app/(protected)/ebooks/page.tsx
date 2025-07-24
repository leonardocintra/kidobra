import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EbooksPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My eBooks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The list of eBooks you've created will appear here. This feature will be implemented soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
