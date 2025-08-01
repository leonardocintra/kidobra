'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Ebook } from '@/lib/types';

interface DeleteEbookDialogProps {
  ebook: Ebook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ebookId: string) => Promise<void>;
}

export default function DeleteEbookDialog({ ebook, open, onOpenChange, onConfirm }: DeleteEbookDialogProps) {
  if (!ebook) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o eBook "{ebook.nome}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(ebook.id)}>
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
