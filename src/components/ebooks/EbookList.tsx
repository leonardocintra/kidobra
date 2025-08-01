'use client';

import type { Ebook } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MoreVertical, Copy, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface EbookListProps {
  ebooks: Ebook[];
  onSelect: (ebook: Ebook) => void;
  onClone: (ebook: Ebook) => void;
  onDelete: (ebook: Ebook) => void;
  onEdit: (ebook: Ebook) => void;
}

export default function EbookList({ ebooks, onSelect, onClone, onDelete, onEdit }: EbookListProps) {
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
      {ebooks.map((ebook) => (
        <Card key={ebook.id} className="flex flex-col justify-between p-4">
          <div>
            <h3 className="font-semibold">{ebook.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Criado em: {format(new Date(ebook.data), 'dd/MM/yyyy')}
            </p>
             <p className="text-sm text-muted-foreground">{ebook.atividades.length} atividades</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => onSelect(ebook)}>
              Selecionar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(ebook)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onClone(ebook)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clonar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(ebook)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}
