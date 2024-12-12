// frontend/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { PrivateChatProvider } from '@/contexts/PrivateChatContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Zenit',
  description: 'Sistema de Atendimento Multicanal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <PrivateChatProvider>
          {children}
        </PrivateChatProvider>
      </body>
    </html>
  );
}