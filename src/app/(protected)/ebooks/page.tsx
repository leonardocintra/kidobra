'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEbooks } from '@/hooks/useEbooks';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, ExternalLink, PlusCircle } from 'lucide-react';
import Spinner from '@/components/Spinner';
import EbookList from '@/components/ebooks/EbookList';
import CreateEbookModal from '@/components/ebooks/CreateEbookModal';
import EditEbookModal from '@/components/ebooks/EditEbookModal';
import CloneEbookModal from '@/components/ebooks/CloneEbookModal';
import DeleteEbookDialog from '@/components/ebooks/DeleteEbookDialog';
import type { Ebook } from '@/lib/types';


export default function EbooksPage() {
  const { user } = useAuth();
  const { ebooks, loading, createEbook, updateEbook, deleteEbook, cloneEbook, selectEbook } = useEbooks();
  const { toast } = useToast();
  const router = useRouter();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [cloningEbook, setCloningEbook] = useState<Ebook | null>(null);
  const [deletingEbook, setDeletingEbook] = useState<Ebook | null>(null);

  const handleCreate = async (nome: string) => {
    try {
      await createEbook(nome);
      toast({ title: 'eBook criado com sucesso!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar eBook', description: (error as Error).message });
    }
  };
  
  const handleEdit = async (ebookId: string, nome: string) => {
    try {
      await updateEbook(ebookId, nome);
      toast({ title: 'eBook renomeado com sucesso!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao renomear eBook', description: (error as Error).message });
    }
  }

  const handleClone = async (ebook: Ebook, novoNome: string) => {
    try {
        await cloneEbook(ebook, novoNome);
        toast({ title: 'eBook clonado com sucesso!' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao clonar eBook', description: (error as Error).message });
    }
  }

  const handleDelete = async (ebookId: string) => {
    try {
        await deleteEbook(ebookId);
        toast({ title: 'eBook excluído com sucesso!' });
        setDeletingEbook(null);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao excluir eBook', description: (error as Error).message });
    }
  }

  const handleSelect = (ebook: Ebook) => {
    selectEbook(ebook);
    router.push(`/ebooks/${ebook.id}`);
  }

  const NonSubscriberContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Crown className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Funcionalidade Premium</h3>
        <p className="text-muted-foreground">
            Crie, edite e gerencie seus próprios eBooks de atividades com uma assinatura ativa.
        </p>
        <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="https://leonardocintra.com.br" target="_blank">
                Ativar Assinatura para Criar eBooks
                <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
        </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Meus eBooks</CardTitle>
                <CardDescription>Crie e gerencie seus cadernos de atividades.</CardDescription>
            </div>
          {user?.isSubscriber && (
            <Button onClick={() => setCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Novo eBook
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : user?.isSubscriber ? (
            <EbookList
                ebooks={ebooks}
                onSelect={handleSelect}
                onEdit={(ebook) => setEditingEbook(ebook)}
                onClone={(ebook) => setCloningEbook(ebook)}
                onDelete={(ebook) => setDeletingEbook(ebook)}
            />
          ) : (
            <NonSubscriberContent />
          )}
        </CardContent>
      </Card>
      
      {/* Modals and Dialogs */}
      <CreateEbookModal 
        open={isCreateModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
      />
      <EditEbookModal 
        ebook={editingEbook}
        open={!!editingEbook}
        onOpenChange={(open) => !open && setEditingEbook(null)}
        onSubmit={handleEdit}
      />
      <CloneEbookModal
        ebook={cloningEbook}
        open={!!cloningEbook}
        onOpenChange={(open) => !open && setCloningEbook(null)}
        onSubmit={handleClone}
      />
      <DeleteEbookDialog
        ebook={deletingEbook}
        open={!!deletingEbook}
        onOpenChange={(open) => !open && setDeletingEbook(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
