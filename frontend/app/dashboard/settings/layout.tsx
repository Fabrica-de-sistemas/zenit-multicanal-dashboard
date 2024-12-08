// frontend/app/dashboard/settings/layout.tsx
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function SettingsLayout({
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