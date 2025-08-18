'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import atividadesData from '@/data/atividades.json';
import categoriasData from '@/data/categorias.json';
import type { Atividade, Categoria } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Spinner from '@/components/Spinner';

const ATIVIDADES_POR_PAGINA = 20;

export default function AtividadesPorCategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaId = params.categoriaId as string;

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadesExibidas, setAtividadesExibidas] = useState<Atividade[]>([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoriaId) {
      const categoriaEncontrada = categoriasData.find(c => c.id === categoriaId) as Categoria | undefined;
      setCategoria(categoriaEncontrada || null);

      let atividadesFiltradas;
      if (categoriaEncontrada?.todasAtividades) {
         atividadesFiltradas = atividadesData;
      } else {
         atividadesFiltradas = atividadesData.filter(a => a.categoria === categoriaId);
      }
      
      setAtividades(atividadesFiltradas as Atividade[]);
      setAtividadesExibidas(atividadesFiltradas.slice(0, ATIVIDADES_POR_PAGINA) as Atividade[]);
      setLoading(false);
    }
  }, [categoriaId]);

  const carregarMaisAtividades = () => {
    const proximaPagina = pagina + 1;
    const novasAtividades = atividades.slice(0, proximaPagina * ATIVIDADES_POR_PAGINA);
    setAtividadesExibidas(novasAtividades as Atividade[]);
    setPagina(proximaPagina);
  };

  const totalAtividades = atividades.length;
  const atividadesCarregadas = atividadesExibidas.length;
  const hasMore = atividadesCarregadas < totalAtividades;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!categoria) {
    return <div className="text-center">Categoria não encontrada.</div>;
  }

  return (
    <div className="space-y-8">
       <Button variant="outline" onClick={() => router.push('/')}>
        <ArrowLeft className="mr-2 h-4 w-4"/>
        Voltar para Categorias
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{categoria.nome}</h1>
        <p className="text-muted-foreground">
          {totalAtividades} atividades encontradas. Exibindo {atividadesCarregadas}.
        </p>
      </div>

      {atividadesExibidas.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {atividadesExibidas.map((atividade) => (
            <Card key={atividade.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[210/297] w-full bg-muted">
                   <Image
                      src={atividade.imagemUrl}
                      alt={`Atividade ${atividade.ordem} da categoria ${categoria.nome}`}
                      width={420}
                      height={594}
                      className="h-full w-full object-cover"
                      priority={false}
                      data-ai-hint="coloring page"
                    />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">Nenhuma atividade encontrada nesta categoria.</p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={carregarMaisAtividades} variant="outline">
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
