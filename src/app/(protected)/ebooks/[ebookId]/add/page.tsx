'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import categoriasData from '@/data/categorias.json';
import type { Categoria } from '@/lib/types';
import CategoryCard from '@/components/categories/CategoryCard';

export default function AddActivityPage() {
    const params = useParams();
    const router = useRouter();
    const ebookId = params.ebookId as string;

    const categorias: Categoria[] = categoriasData;
    const baseUrl = `/ebooks/${ebookId}/add`;

  return (
    <div className="space-y-8">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Voltar
        </Button>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Selecione uma Categoria</h1>
        <p className="text-muted-foreground">
          Escolha uma categoria para ver as atividades disponíveis.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categorias.map((categoria) => (
          <CategoryCard 
            key={categoria.id} 
            categoria={categoria}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  );
}
