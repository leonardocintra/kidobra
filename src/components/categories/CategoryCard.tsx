'use client';

import Image from 'next/image';
import Link from 'next/link';

import atividadesData from '@/data/atividades.json';
import type { Categoria } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryCardProps {
    categoria: Categoria;
    baseUrl?: string;
}

export default function CategoryCard({ categoria, baseUrl = '/atividades' }: CategoryCardProps) {
  const atividadesCount = categoria.todasAtividades
    ? atividadesData.length
    : atividadesData.filter(a => a.categoria === categoria.id).length;

  return (
    <Link href={`${baseUrl}/${categoria.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary">
        <CardContent className="p-0">
          <div className="w-full overflow-hidden bg-muted">
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
        <CardHeader className="text-center p-3">
          <CardTitle className="text-base font-semibold group-hover:text-primary">
            {categoria.nome}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{atividadesCount} atividades</p>
        </CardHeader>
      </Card>
    </Link>
  );
}
