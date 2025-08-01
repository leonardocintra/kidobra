'use client';

import { Menu, Book, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SideDrawer from './SideDrawer';
import { useState } from 'react';
import { useEbooks } from '@/hooks/useEbooks';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { selectedEbook } = useEbooks();
    const router = useRouter();

    const handleEbookClick = () => {
        if(selectedEbook) {
            router.push(`/ebooks/${selectedEbook.id}`);
        }
    }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        {selectedEbook ? (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2" onClick={handleEbookClick}>
                            <Book className="h-5 w-5 text-primary" />
                            <span className="font-semibold truncate max-w-48 sm:max-w-xs">{selectedEbook.nome}</span>
                            <Badge variant="secondary" className="rounded-full">{selectedEbook.atividades.length}</Badge>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver detalhes do eBook</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
        ): (
            <div />
        )}

        <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
            </Button>
        </SideDrawer>
      </div>
    </header>
  );
}
