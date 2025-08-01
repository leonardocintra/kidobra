import type { Ebook } from '@/lib/types';

export interface EbookContextType {
  ebooks: Ebook[];
  loading: boolean;
  selectedEbook: Ebook | null;
  createEbook: (nome: string) => Promise<void>;
  updateEbook: (ebookId: string, nome: string) => Promise<void>;
  deleteEbook: (ebookId: string) => Promise<void>;
  cloneEbook: (ebook: Ebook, novoNome: string) => Promise<void>;
  selectEbook: (ebook: Ebook | null) => void;
}

export interface EbookProviderProps {
  children: React.ReactNode;
}
