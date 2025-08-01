'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEbooks } from '@/hooks/useEbooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ebookId = params.ebookId as string;
  const { ebooks, selectedEbook, selectEbook, loading } = useEbooks();

  useEffect(() => {
    // If there's no selected ebook or the wrong one is selected, find the correct one.
    if (!selectedEbook || selectedEbook.id !== ebookId) {
      const ebookFromList = ebooks.find((e) => e.id === ebookId);
      if (ebookFromList) {
        selectEbook(ebookFromList);
      }
    }
  }, [ebookId, ebooks, selectedEbook, selectEbook]);

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

  return (
    <div className="space-y-8">
       <Button variant="outline" onClick={() => router.push('/ebooks')}>
        <ArrowLeft className="mr-2 h-4 w-4"/>
        Voltar para Meus eBooks
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{selectedEbook.nome}</CardTitle>
          <CardDescription>
            Aqui você poderá ver e gerenciar as atividades do seu eBook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A funcionalidade de adicionar e remover atividades será implementada em breve.
          </p>
          <p className="mt-4 font-semibold">Atividades atuais: {selectedEbook.atividades.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}
