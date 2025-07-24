'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SideDrawer from './SideDrawer';
import { useState } from 'react';

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <h1 className="text-2xl font-bold text-gray-800">Kidobra</h1>
        <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>
        </SideDrawer>
      </div>
    </header>
  );
}
