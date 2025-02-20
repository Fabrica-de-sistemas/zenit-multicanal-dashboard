// frontend/app/(auth)/home/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MessagesSquare,
  BarChart3,
  Users,
  LineChart,
  Zap,
  Globe,
  CheckCircle2,
  Timer,
  TrendingUp,
  ExternalLink,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-500'
    },
    {
      name: 'Instagram',
      bgColor: 'bg-fuchsia-950/40',
      borderColor: 'border-fuchsia-500/40',
      textColor: 'text-fuchsia-400',
      dotColor: 'bg-fuchsia-500'
    },
    {
      name: 'Facebook',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      dotColor: 'bg-blue-500'
    },
    {
      name: 'Email',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      dotColor: 'bg-purple-500'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Omnichannel Nativo",
      description: "Integração perfeita com WhatsApp, Instagram, Facebook e mais",
      bgColor: "bg-blue-950/40",
      textColor: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Resposta Instantânea",
      description: "IA avançada para automação inteligente do atendimento",
      bgColor: "bg-emerald-950/40",
      textColor: "text-emerald-400"
    },
    {
      icon: LineChart,
      title: "Analytics Avançado",
      description: "Insights profundos sobre cada interação com seus clientes",
      bgColor: "bg-purple-950/40",
      textColor: "text-purple-400"
    },
    {
      icon: CheckCircle2,
      title: "Qualidade Garantida",
      description: "Monitore e melhore a performance do seu time",
      bgColor: "bg-pink-950/40",
      textColor: "text-pink-400"
    },
    {
      icon: Timer,
      title: "Implementação Rápida",
      description: "Configure e comece a usar em menos de 24 horas",
      bgColor: "bg-orange-950/40",
      textColor: "text-orange-400"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidade Total",
      description: "Cresça sem limites com nossa infraestrutura robusta",
      bgColor: "bg-cyan-950/40",
      textColor: "text-cyan-400"
    }
  ];

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50" />

        <div className="relative container mx-auto px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto e CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-white">
              Transforme seu
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                Atendimento ao Cliente
              </div>
              <div className="text-white">com o Zenit</div>
            </h1>

            <p className="text-xl text-gray-300">
              Unifique todos os seus canais de comunicação em uma única plataforma poderosa e inteligente.
            </p>

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/login')}
                className="bg-blue-500 hover:bg-blue-600 text-lg px-8"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => router.push('/schedule')}
                className="bg-transparent hover:bg-white/5 text-white border border-white/10 hover:border-white/25 transition-colors text-lg px-8"
              >
                Agendar Demo
              </Button>
            </div>

            {/* Métricas de Impacto */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <h3 className="text-3xl font-bold text-blue-400">+65%</h3>
                <p className="text-gray-300">Aumento na Satisfação</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-emerald-400">-45%</h3>
                <p className="text-gray-300">Tempo de Resposta</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-400">+89%</h3>
                <p className="text-gray-300">Eficiência da Equipe</p>
              </div>
            </div>
          </motion.div>
          {/* Visual Interativo */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block w-[850px]" // Ajuste este valor conforme necessário
          >
            <div className="relative w-full aspect-[16/10]"> {/* Mantém a proporção da imagem */}
              <Image
                src="/images/preview.png"
                alt="Interface do Zenit"
                fill
                className="rounded-lg shadow-2xl object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Diferenciais */}
      <section className="py-24 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">Por que as empresas escolhem o Zenit?</h2>
            <p className="text-xl text-gray-300">
              Solução completa que une tecnologia avançada e simplicidade para revolucionar seu atendimento
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group hover:bg-gray-800/50 p-8 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-700"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.textColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Demonstração do Produto */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-2xl p-8 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                  Veja o Zenit em ação
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Agende uma demonstração personalizada e descubra como o Zenit pode transformar o atendimento da sua empresa.
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {[
                    "Demonstração completa da plataforma",
                    "Análise das suas necessidades específicas",
                    "Simulação com seus canais de atendimento",
                    "Consultoria de implementação gratuita"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </motion.div>
                <Button
                  size="lg"
                  className="mt-8 bg-white text-gray-900 hover:bg-gray-200"
                >
                  Agendar Demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">Vídeo Demonstrativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Zenit. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}