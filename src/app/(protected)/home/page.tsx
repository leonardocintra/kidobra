'use client';

import Image from 'next/image';
import Link from 'next/link';

import categoriasData from '@/data/categorias.json';
import type { Categoria } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CategoryCard({ categoria }: { categoria: Categoria }) {
  return (
    <Link href={`/atividades/${categoria.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary">
        <CardContent className="p-0">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={categoria.imagemUrl}
              alt={categoria.nome}
              width={300}
              height={169}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
              data-ai-hint="children playing illustration"
            />
          </div>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-center text-base font-semibold group-hover:text-primary">
            {categoria.nome}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const categorias: Categoria[] = categoriasData;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Explore nossas categorias</h1>
        <p className="text-muted-foreground">
          Encontre a atividade perfeita para cada momento de aprendizado.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categorias.map((categoria) => (
          <CategoryCard key={categoria.id} categoria={categoria} />
        ))}
      </div>
    </div>
  );
}
