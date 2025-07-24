'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/ebooks', icon: Book, label: 'eBooks' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 max-w-4xl items-center justify-around px-4">
        {navItems.map((item) => {
          // Special case for root, as pathname is '/' but we want to match '/home'
           const isActive = pathname === '/' ? item.href === '/home' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href === '/home' ? '/' : item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-md transition-colors',
                isActive
                  ? 'text-primary-foreground bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
