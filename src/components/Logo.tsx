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
        src="https://storage.googleapis.com/kidobra-starter.firebasestorage.app/o/logo.png?alt=media&token=1d331908-161b-4f6b-95d4-72a39281a8c3"
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
