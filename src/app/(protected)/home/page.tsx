'use client';

import categoriasData from '@/data/categorias.json';
import type { Categoria } from '@/lib/types';
import CategoryCard from '@/components/categories/CategoryCard';


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
