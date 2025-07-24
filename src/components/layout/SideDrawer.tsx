import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ReactNode } from 'react';

interface SideDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export default function SideDrawer({ open, onOpenChange, children }: SideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Future navigation items will be placed here.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
