'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { Atividade, Ebook } from '@/lib/types';
import type { EbookContextType, EbookProviderProps } from './EbookContext.types';
import { useToast } from '@/hooks/use-toast';

const SELECTED_EBOOK_STORAGE_KEY = 'selectedEbookId';

export const EbookContext = createContext<EbookContextType | undefined>(undefined);

export function EbookProvider({ children }: EbookProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  const fetchEbooks = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const ebooksCollection = collection(firestore, `usuarios/${user.uid}/ebooks`);
        const q = query(ebooksCollection, orderBy('data', 'desc'));
        const querySnapshot = await getDocs(q);
        const userEbooks = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              data: (doc.data().data as Timestamp).toDate().toISOString(),
            } as Ebook)
        );
        setEbooks(userEbooks);

        try {
            const storedEbookId = localStorage.getItem(SELECTED_EBOOK_STORAGE_KEY);
            if (storedEbookId) {
                const ebookToSelect = userEbooks.find(e => e.id === storedEbookId);
                if (ebookToSelect) {
                    setSelectedEbook(ebookToSelect);
                } else {
                    localStorage.removeItem(SELECTED_EBOOK_STORAGE_KEY);
                }
            }
        } catch (e) {
            console.warn("Could not access localStorage. Selected ebook won't persist.", e);
        }

      } catch (error) {
        console.error('Erro ao buscar eBooks:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setEbooks([]);
      setSelectedEbook(null);
      try {
        localStorage.removeItem(SELECTED_EBOOK_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const createEbook = async (nome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');

    const newEbookData = {
      nome,
      data: Timestamp.fromDate(new Date()),
      atividades: [],
    };

    const ebooksCollection = collection(firestore, `usuarios/${user.uid}/ebooks`);
    const docRef = await addDoc(ebooksCollection, newEbookData);
    
    const newEbook: Ebook = {
      id: docRef.id,
      nome,
      data: newEbookData.data.toDate().toISOString(),
      atividades: []
    }

    setEbooks(prev => [newEbook, ...prev]);
  };

  const updateEbook = async (ebookId: string, nome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, ebookId);
    await updateDoc(ebookDocRef, { nome });
    
    const updateLocal = (prev: Ebook) => ({ ...prev, nome });

    setEbooks(ebooks.map((e) => (e.id === ebookId ? updateLocal(e) : e)));
    if (selectedEbook?.id === ebookId) {
      setSelectedEbook(updateLocal(selectedEbook));
    }
  };

  const deleteEbook = async (ebookId: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, ebookId);
    await deleteDoc(ebookDocRef);
    setEbooks(ebooks.filter((e) => e.id !== ebookId));
    if (selectedEbook?.id === ebookId) {
      selectEbook(null);
    }
  };

  const cloneEbook = async (ebook: Ebook, novoNome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const newEbookData = {
      nome: novoNome,
      data: Timestamp.fromDate(new Date()),
      atividades: ebook.atividades,
    };
    const ebooksCollection = collection(firestore, `usuarios/${user.uid}/ebooks`);
    await addDoc(ebooksCollection, newEbookData);
    
    await fetchEbooks(); // Refetch to get all data sorted correctly
  };
  
  const selectEbook = (ebook: Ebook | null) => {
    setSelectedEbook(ebook);
    try {
        if (ebook) {
            localStorage.setItem(SELECTED_EBOOK_STORAGE_KEY, ebook.id);
        } else {
            localStorage.removeItem(SELECTED_EBOOK_STORAGE_KEY);
        }
    } catch (e) {
        console.warn("Could not access localStorage to persist selected ebook.", e);
    }
  };

  const addAtividadeToEbook = async (atividade: Atividade) => {
    if (!user || !selectedEbook) throw new Error("eBook não selecionado ou usuário não autenticado.");

    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, selectedEbook.id);

    try {
        await runTransaction(firestore, async (transaction) => {
            const ebookDoc = await transaction.get(ebookDocRef);
            if (!ebookDoc.exists()) {
                throw "eBook não encontrado!";
            }
            const currentAtividades = ebookDoc.data().atividades || [];
            
            // Check if activity already exists
            if (currentAtividades.some((a: Atividade) => a.id === atividade.id)) {
                toast({ variant: 'default', title: 'Atividade já existe no eBook.' });
                return;
            }
            
            const newAtividades = [...currentAtividades, atividade];
            transaction.update(ebookDocRef, { atividades: newAtividades });
        });

        // Update local state
        const updatedEbook = { ...selectedEbook, atividades: [...selectedEbook.atividades, atividade] };
        setSelectedEbook(updatedEbook);
        setEbooks(ebooks.map(e => e.id === selectedEbook.id ? updatedEbook : e));
        toast({ title: 'Atividade adicionada com sucesso!' });

    } catch (error) {
        console.error("Erro ao adicionar atividade:", error);
        toast({ variant: 'destructive', title: 'Erro ao adicionar atividade', description: (error as Error).message });
    }
  }

  const removeAtividadeFromEbook = async (atividadeId: string) => {
    if (!user || !selectedEbook) return;

    const newAtividades = selectedEbook.atividades.filter(a => a.id !== atividadeId);
    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, selectedEbook.id);
    await updateDoc(ebookDocRef, { atividades: newAtividades });

    const updatedEbook = { ...selectedEbook, atividades: newAtividades };
    setSelectedEbook(updatedEbook);
    setEbooks(ebooks.map(e => e.id === selectedEbook.id ? updatedEbook : e));
    toast({ title: 'Atividade removida.' });
  }

  const reorderAtividadesInEbook = async (atividades: Atividade[]) => {
      if (!user || !selectedEbook) return;
      const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, selectedEbook.id);
      await updateDoc(ebookDocRef, { atividades });

      const updatedEbook = { ...selectedEbook, atividades: atividades };
      setSelectedEbook(updatedEbook);
      setEbooks(ebooks.map(e => e.id === selectedEbook.id ? updatedEbook : e));
  }


  const value = {
    ebooks,
    loading,
    selectedEbook,
    createEbook,
    updateEbook,
    deleteEbook,
    cloneEbook,
    selectEbook,
    addAtividadeToEbook,
    removeAtividadeFromEbook,
    reorderAtividadesInEbook,
  };

  return <EbookContext.Provider value={value}>{children}</EbookContext.Provider>;
}
