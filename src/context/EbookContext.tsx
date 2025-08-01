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
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { Ebook } from '@/lib/types';
import type { EbookContextType, EbookProviderProps } from './EbookContext.types';

export const EbookContext = createContext<EbookContextType | undefined>(undefined);

export function EbookProvider({ children }: EbookProviderProps) {
  const { user } = useAuth();
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
      } catch (error) {
        console.error('Erro ao buscar eBooks:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setEbooks([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const createEbook = async (nome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');

    const newEbook = {
      nome,
      data: new Date().toISOString(),
      atividades: [],
    };

    const ebooksCollection = collection(firestore, `usuarios/${user.uid}/ebooks`);
    const docRef = await addDoc(ebooksCollection, {
      ...newEbook,
      data: Timestamp.fromDate(new Date(newEbook.data)),
    });
    setEbooks([{ ...newEbook, id: docRef.id }, ...ebooks]);
  };

  const updateEbook = async (ebookId: string, nome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, ebookId);
    await updateDoc(ebookDocRef, { nome });
    setEbooks(ebooks.map((e) => (e.id === ebookId ? { ...e, nome } : e)));
    if (selectedEbook?.id === ebookId) {
      setSelectedEbook({ ...selectedEbook, nome });
    }
  };

  const deleteEbook = async (ebookId: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const ebookDocRef = doc(firestore, `usuarios/${user.uid}/ebooks`, ebookId);
    await deleteDoc(ebookDocRef);
    setEbooks(ebooks.filter((e) => e.id !== ebookId));
    if (selectedEbook?.id === ebookId) {
      setSelectedEbook(null);
    }
  };

  const cloneEbook = async (ebook: Ebook, novoNome: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    const newEbook = {
      nome: novoNome,
      data: new Date().toISOString(),
      atividades: ebook.atividades,
    };
    const ebooksCollection = collection(firestore, `usuarios/${user.uid}/ebooks`);
    const docRef = await addDoc(ebooksCollection, {
      ...newEbook,
      data: Timestamp.fromDate(new Date(newEbook.data)),
    });
    setEbooks([{ ...newEbook, id: docRef.id }, ...ebooks]);
  };
  
  const selectEbook = (ebook: Ebook | null) => {
    setSelectedEbook(ebook);
  };

  const value = {
    ebooks,
    loading,
    selectedEbook,
    createEbook,
    updateEbook,
    deleteEbook,
    cloneEbook,
    selectEbook,
  };

  return <EbookContext.Provider value={value}>{children}</EbookContext.Provider>;
}
