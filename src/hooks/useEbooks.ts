'use client';

import { useContext } from 'react';
import { EbookContext } from '@/context/EbookContext';
import type { EbookContextType } from '@/context/EbookContext.types';

export const useEbooks = (): EbookContextType => {
  const context = useContext(EbookContext);
  if (context === undefined) {
    throw new Error('useEbooks must be used within an EbookProvider');
  }
  return context;
};
