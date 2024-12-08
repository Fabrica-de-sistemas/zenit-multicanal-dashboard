//frontend/app/(auth)/layout.tsx
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        {children}
      </main>
    );
  }