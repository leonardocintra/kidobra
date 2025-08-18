'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export default function Logo({ className, width = 128, height = 128 }: LogoProps) {
  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/kidobra-starter.firebasestorage.app/o/kidobra-logo.jpg?alt=media&token=8f68794e-31ea-4acb-bf87-fab5360534b1"
        alt="Kidobra Logo"
        width={width}
        height={height}
        className="rounded-full"
        priority
        data-ai-hint="logo"
      />
    </div>
  );
}
