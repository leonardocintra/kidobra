'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Spinner from '../Spinner';

interface PdfLoadingModalProps {
  open: boolean;
}

export default function PdfLoadingModal({ open }: PdfLoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent 
        className="max-w-xs"
        hideCloseButton={true}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Gerando PDF</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <Spinner size="lg" />
          <p className="text-lg font-medium text-center">Gerando seu eBook...</p>
          <p className="text-sm text-muted-foreground text-center">Isso pode levar alguns instantes.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
