// frontend/app/dashboard/company-chat/layout.tsx
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function CompanyChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}