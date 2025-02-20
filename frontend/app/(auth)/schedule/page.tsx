// frontend/app/(auth)/schedule/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SchedulePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <div className="mb-12">
          <Button
            variant="link"
            className="text-gray-400"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Agende uma Demonstração
            </h1>
            <p className="text-gray-300 text-lg">
              Descubra como o Zenit pode transformar o atendimento da sua empresa
            </p>
          </motion.div>
        </div>

        {/* Formulário de Agendamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Informações da Empresa */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Informações da Empresa</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white" 
                    placeholder="Digite o nome da sua empresa"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white" 
                    placeholder="Digite seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    type="email"
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white" 
                    placeholder="seuemail@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Data Preferencial</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    type="date"
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">Mensagem (Opcional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Textarea 
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white resize-none" 
                    placeholder="Conte-nos mais sobre suas necessidades..."
                    rows={4}
                  />
                </div>
              </div>

              <Button 
                size="lg"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6"
              >
                Solicitar Demonstração
              </Button>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <h3 className="text-white text-lg mb-2">Precisa de ajuda?</h3>
            <p className="text-gray-400">
              Entre em contato conosco pelo email{' '}
              <a href="mailto:contato@zenit.com" className="text-blue-400 hover:underline">
                contato@zenit.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}