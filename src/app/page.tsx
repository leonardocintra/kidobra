'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We don't want to redirect until we are sure about the auth state.
    if (!loading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // While loading, show a spinner to prevent the user from seeing a flash of the login page.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}
