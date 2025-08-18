'use client';

import Image from 'next/image';
import type { Atividade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface AtividadeEbookCardProps {
  atividade: Atividade;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function AtividadeEbookCard({
  atividade,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
}: AtividadeEbookCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Imagem */}
          <div className="w-1/3 flex-shrink-0">
            <div className="aspect-[210/297] w-full bg-muted rounded-md overflow-hidden">
              <Image
                src={atividade.imagemUrl}
                alt={`Atividade ${atividade.ordem}`}
                width={210}
                height={297}
                className="h-full w-full object-cover"
                data-ai-hint="coloring page"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onMoveUp}
              disabled={isFirst}
              aria-label="Mover para cima"
            >
              <ArrowUp />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="Mover para baixo"
            >
              <ArrowDown />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onDelete}
              aria-label="Excluir atividade"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
