'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { useToast } from './use-toast';
import type { Ebook } from '@/lib/types';

// A4 dimensions in points (1/72 inch)
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

export function usePdfExporter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const exportToPdf = async (ebook: Ebook) => {
    if (!ebook || ebook.atividades.length === 0) {
      toast({
        variant: 'destructive',
        title: 'eBook vazio',
        description: 'Não há atividades para exportar.',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      for (let i = 0; i < ebook.atividades.length; i++) {
        const atividade = ebook.atividades[i];
        
        // The image needs to be fetched via a proxy to avoid CORS issues
        const imageProxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(atividade.imagemUrl)}`;

        const response = await fetch(imageProxyUrl);
        if (!response.ok) {
           throw new Error(`Falha ao carregar a imagem: ${atividade.imagemUrl}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imageDataUrl,
          'JPEG', // Or other format depending on the source
          0,
          0,
          A4_WIDTH_PT,
          A4_HEIGHT_PT
        );
      }
      
      const pdfBlob = pdf.output('blob');
      const fileName = `${ebook.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Use Web Share API on mobile if available
      if (navigator.share && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
        await navigator.share({
          title: ebook.nome,
          text: `Confira o eBook: ${ebook.nome}`,
          files: [new File([pdfBlob], fileName, { type: 'application/pdf' })],
        });
      } else {
        // Fallback to download on desktop
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }


    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar o eBook',
        description: 'Não foi possível gerar o PDF. Tente novamente mais tarde.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, exportToPdf };
}
