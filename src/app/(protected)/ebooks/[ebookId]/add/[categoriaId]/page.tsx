'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useEbooks } from '@/hooks/useEbooks';
import atividadesData from '@/data/atividades.json';
import categoriasData from '@/data/categorias.json';
import type { Atividade, Categoria } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Spinner from '@/components/Spinner';

const ATIVIDADES_POR_PAGINA = 20;

export default function AddAtividadeCategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const { ebookId, categoriaId } = params as { ebookId: string; categoriaId: string; };

  const { addAtividadeToEbook, selectedEbook } = useEbooks();

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadesExibidas, setAtividadesExibidas] = useState<Atividade[]>([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

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

  const handleAddAtividade = async (atividade: Atividade) => {
    setAddingId(atividade.id);
    try {
        await addAtividadeToEbook(atividade);
    } finally {
        setAddingId(null);
    }
  }

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
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  if (!categoria) {
    return <div className="text-center">Categoria não encontrada.</div>;
  }

  return (
    <div className="space-y-8">
       <Button variant="outline" onClick={() => router.push(`/ebooks/${ebookId}/add`)}>
        <ArrowLeft className="mr-2 h-4 w-4"/>
        Voltar para Categorias
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{categoria.nome}</h1>
        <p className="text-muted-foreground">
          {totalAtividades} atividades encontradas. Clique para adicionar ao seu eBook.
        </p>
      </div>

      {atividadesExibidas.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {atividadesExibidas.map((atividade) => {
             const isAlreadyAdded = selectedEbook?.atividades.some(a => a.id === atividade.id);
             const isAdding = addingId === atividade.id;
            return (
                <Card key={atividade.id} className="overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-grow">
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
                <CardFooter className="p-4">
                     <Button 
                        className="w-full"
                        onClick={() => handleAddAtividade(atividade)}
                        disabled={isAlreadyAdded || isAdding}
                     >
                        {isAdding ? (
                            <Spinner size="sm" />
                        ) : isAlreadyAdded ? (
                            'Já Adicionada'
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar ao eBook
                            </>
                        )}
                     </Button>
                </CardFooter>
                </Card>
          )})}
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
