import Header from './Header';
import BottomNav from './BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow overflow-y-auto pt-20 pb-24">
        <div className="container mx-auto max-w-4xl px-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
