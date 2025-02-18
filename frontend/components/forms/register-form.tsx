// components/forms/register-form.tsx
'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sectorRoles } from '@/utils/roleConfig';

interface FormData {
  fullName: string;
  email: string;
  registration: string;
  password: string;
  confirmPassword: string;
  sector: string;
  role: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
  validator: (password: string) => boolean;
}

const getPasswordRequirements = (password: string): PasswordRequirement[] => [
  {
    text: 'Mínimo de 6 caracteres',
    met: password.length >= 6,
    validator: (pwd) => pwd.length >= 6
  },
  {
    text: 'Pelo menos uma letra maiúscula',
    met: /[A-Z]/.test(password),
    validator: (pwd) => /[A-Z]/.test(pwd)
  },
  {
    text: 'Pelo menos um número',
    met: /[0-9]/.test(password),
    validator: (pwd) => /[0-9]/.test(pwd)
  },
  {
    text: 'Pelo menos um caractere especial (!@#$%&*)',
    met: /[!@#$%&*]/.test(password),
    validator: (pwd) => /[!@#$%&*]/.test(pwd)
  }
];

export function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    registration: '',
    password: '',
    confirmPassword: '',
    sector: '',
    role: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    const requirements = getPasswordRequirements(password);
    return requirements.every(req => req.validator(password));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.sector) {
      newErrors.sector = 'Setor é obrigatório';
    }
    
    if (!formData.role) {
      newErrors.role = 'Cargo é obrigatório';
    }

    if (!formData.registration.trim()) {
      newErrors.registration = 'Matrícula é obrigatória';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'A senha não atende aos requisitos mínimos';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log('1. Iniciando processo de registro...');

      const dataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        registration: formData.registration,
        password: formData.password,
        sector: formData.sector,    // Adicionado
        role: formData.role         // Adicionado
      };

      console.log('2. Dados a serem enviados:', {
        ...dataToSend,
        password: '[PROTEGIDO]'
      });

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('3. Status da resposta:', response.status);

      const result = await response.json();
      console.log('4. Resposta do servidor:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer registro');
      }

      setMessage({
        type: 'success',
        text: 'Registro realizado com sucesso!'
      });

      setFormData({
        fullName: '',
        email: '',
        registration: '',
        password: '',
        confirmPassword: '',
        sector: '',
        role: ''
      });

      console.log('5. Registro concluído com sucesso');

    } catch (error) {
      console.error('Erro no registro:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao fazer registro'
      });
    } finally {
      setIsLoading(false);
      console.log('6. Processo finalizado');
    }
  };

  return (
    <>
      {message && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nome Completo"
              className="pl-10"
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail Corporativo</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nome@empresa.com"
              className="pl-10"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Setor</label>
          <div className="relative">
            <select
              name="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value, role: '' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um setor</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="RH">RH</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Comercial">Comercial</option>
              <option value="Suporte">Suporte</option>
              <option value="Geral">Geral</option>
            </select>
          </div>
          {errors.sector && (
            <p className="text-sm text-red-500">{errors.sector}</p>
          )}
        </div>

        {formData.sector && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Cargo</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cargo</option>
                {sectorRoles[formData.sector as keyof typeof sectorRoles]?.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Matrícula</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              name="registration"
              value={formData.registration}
              onChange={handleChange}
              placeholder="Digite sua matrícula"
              className="pl-10"
            />
          </div>
          {errors.registration && (
            <p className="text-sm text-red-500">{errors.registration}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Requisitos da senha */}
          <div className="mt-2 space-y-2 text-sm">
            {getPasswordRequirements(formData.password).map((requirement, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 ${formData.password ? (requirement.met ? 'text-green-600' : 'text-gray-600') : 'text-gray-600'
                  }`}
              >
                {formData.password ? (
                  requirement.met ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                <span>{requirement.text}</span>
              </div>
            ))}
          </div>

          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-sm text-red-500 text-center">{errors.submit}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </Button>

        <div className="text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={() => window.location.href = '/login'}
          >
            Faça login
          </Button>
        </div>
      </form>
    </>
  );
}