// frontend/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removido o padding e adicionado w-full h-full
    <main className="min-h-screen w-full">
      {children}
    </main>
  );
}