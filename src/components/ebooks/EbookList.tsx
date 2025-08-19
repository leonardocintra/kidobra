'use client';

import type { Ebook } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Trash2, Edit, CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useEbooks } from '@/hooks/useEbooks';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface EbookListProps {
  ebooks: Ebook[];
  onSelect: (ebook: Ebook) => void;
  onClone: (ebook: Ebook) => void;
  onDelete: (ebook: Ebook) => void;
  onEdit: (ebook: Ebook) => void;
  onExport: (ebook: Ebook) => void;
  isGeneratingPdf: boolean;
}

export default function EbookList({ ebooks, onSelect, onClone, onDelete, onEdit, onExport, isGeneratingPdf }: EbookListProps) {
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
    <TooltipProvider>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => {
            const isSelected = selectedEbook?.id === ebook.id;

            return (
                <Card 
                    key={ebook.id} 
                    className={cn(
                        "flex flex-col justify-between p-4 transition-all cursor-pointer hover:shadow-lg", 
                        isSelected && "ring-2 ring-primary"
                    )}
                    onClick={() => onSelect(ebook)}
                >
                    <div>
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{ebook.nome}</h3>
                        {isSelected && <Badge variant="secondary" className="flex-shrink-0"><CheckCircle className="mr-1 h-3 w-3" />Ativo</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Criado em: {format(new Date(ebook.data), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">{ebook.atividades.length} atividades</p>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={isGeneratingPdf || ebook.atividades.length === 0} 
                                    onClick={(e) => { e.stopPropagation(); onExport(ebook); }}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Exportar para PDF</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Exportar para PDF</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(ebook); }}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Renomear</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Renomear</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onClone(ebook); }}>
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Clonar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Clonar</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(ebook); }} className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Excluir</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Excluir</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
            </Card>
            )
        })}
        </div>
    </TooltipProvider>
  );
}
