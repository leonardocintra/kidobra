'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEbooks } from '@/hooks/useEbooks';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, FileWarning } from 'lucide-react';
import AtividadeEbookCard from '@/components/ebooks/AtividadeEbookCard';
import type { Atividade } from '@/lib/types';

export default function EbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ebookId = params.ebookId as string;
  const { ebooks, selectedEbook, selectEbook, loading, removeAtividadeFromEbook, reorderAtividadesInEbook } = useEbooks();
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedEbook || selectedEbook.id !== ebookId) {
      const ebookFromList = ebooks.find((e) => e.id === ebookId);
      if (ebookFromList) {
        selectEbook(ebookFromList);
      }
    }
  }, [ebookId, ebooks, selectedEbook, selectEbook]);

  const handleMove = useCallback(async (index: number, direction: 'up' | 'down') => {
    if (!selectedEbook) return;

    const newAtividades = Array.from(selectedEbook.atividades);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newAtividades.length) {
      return;
    }

    [newAtividades[index], newAtividades[targetIndex]] = [newAtividades[targetIndex], newAtividades[index]];
    
    try {
      await reorderAtividadesInEbook(newAtividades);
    } catch(error) {
      toast({ variant: 'destructive', title: 'Erro ao reordenar', description: 'Não foi possível salvar a nova ordem.' });
    }
  }, [selectedEbook, reorderAtividadesInEbook, toast]);

  const handleDelete = async (atividadeId: string) => {
    try {
      await removeAtividadeFromEbook(atividadeId);
    } catch(error) {
      toast({ variant: 'destructive', title: 'Erro ao remover', description: 'Não foi possível remover a atividade.' });
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }
  
  if (!selectedEbook) {
    return (
        <div className="text-center">
            <p>eBook não encontrado ou não selecionado.</p>
            <Button variant="link" onClick={() => router.push('/ebooks')}>
                Voltar para a lista de eBooks
            </Button>
        </div>
    );
  }

  const { atividades } = selectedEbook;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/ebooks')}>
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Voltar para Meus eBooks
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{selectedEbook.nome}</CardTitle>
          <CardDescription>
            Gerencie as atividades do seu eBook. Atualmente com {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Button onClick={() => router.push(`/ebooks/${ebookId}/add`)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Atividade
           </Button>
          
          {atividades.length > 0 ? (
            <div className="space-y-4">
              {atividades.map((atividade, index) => (
                <AtividadeEbookCard 
                  key={atividade.id}
                  atividade={atividade}
                  onMoveUp={() => handleMove(index, 'up')}
                  onMoveDown={() => handleMove(index, 'down')}
                  onDelete={() => handleDelete(atividade.id)}
                  isFirst={index === 0}
                  isLast={index === atividades.length - 1}
                />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 py-12 text-center">
                <FileWarning className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade adicionada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Clique em "Adicionar Atividade" para começar a montar seu eBook.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
