'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/Spinner';

export default function InitialRedirectPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect('/home');
      } else {
        redirect('/login');
      }
    }
  }, [user, loading]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}
