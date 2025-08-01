'use client';

import type { Ebook } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Trash2, Edit, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useEbooks } from '@/hooks/useEbooks';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EbookListProps {
  ebooks: Ebook[];
  onSelect: (ebook: Ebook) => void;
  onClone: (ebook: Ebook) => void;
  onDelete: (ebook: Ebook) => void;
  onEdit: (ebook: Ebook) => void;
}

export default function EbookList({ ebooks, onSelect, onClone, onDelete, onEdit }: EbookListProps) {
  const { selectedEbook } = useEbooks();

  if (ebooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 py-12 text-center">
        <h3 className="text-lg font-semibold">Nenhum eBook encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece a criar seu primeiro eBook de atividades!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ebooks.map((ebook) => {
        const isSelected = selectedEbook?.id === ebook.id;

        return (
          <Card key={ebook.id} className={cn("flex flex-col justify-between p-4 transition-all", isSelected && "ring-2 ring-primary")}>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Link href={`/ebooks/${ebook.id}`} className="block truncate">
                    <h3 className="font-semibold truncate hover:underline">{ebook.nome}</h3>
                </Link>
                {isSelected && <Badge variant="secondary" className="flex-shrink-0"><CheckCircle className="mr-1 h-3 w-3" />Selecionado</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Criado em: {format(new Date(ebook.data), 'dd/MM/yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">{ebook.atividades.length} atividades</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => onSelect(ebook)} disabled={isSelected}>
                {isSelected ? 'Já Selecionado' : 'Selecionar'}
              </Button>
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" onClick={() => onEdit(ebook)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Renomear</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onClone(ebook)}>
                  <Copy className="h-4 w-4" />
                   <span className="sr-only">Clonar</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(ebook)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                   <span className="sr-only">Excluir</span>
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  );
}
