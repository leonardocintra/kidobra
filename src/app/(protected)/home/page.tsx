import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Kidobra!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the homepage. The main content of the application will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
