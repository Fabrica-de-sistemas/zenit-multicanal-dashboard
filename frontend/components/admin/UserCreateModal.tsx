// frontend/components/admin/UserCreateModal.tsx
import React, { useState } from 'react';
import { User, Mail, Lock, CreditCard, Eye, EyeOff, X } from 'lucide-react';
import { sectorRoles, type Sector } from '@/utils/roleConfig';

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormData {
    fullName: string;
    email: string;
    registration: string;
    password: string;
    confirmPassword: string;
    sector: Sector | '';
    role: string;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nome é obrigatório';
        }

        if (!formData.email.includes('@')) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.registration.trim()) {
            newErrors.registration = 'Matrícula é obrigatória';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else {
            if (formData.password.length < 6) {
                newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
            }
            if (!/[A-Z]/.test(formData.password)) {
                newErrors.password = 'A senha deve conter pelo menos uma letra maiúscula';
            }
            if (!/[0-9]/.test(formData.password)) {
                newErrors.password = 'A senha deve conter pelo menos um número';
            }
            if (!/[!@#$%&*]/.test(formData.password)) {
                newErrors.password = 'A senha deve conter pelo menos um caractere especial (!@#$%&*)';
            }
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (!formData.sector) {
            newErrors.sector = 'Setor é obrigatório';
        }

        if (!formData.role) {
            newErrors.role = 'Cargo é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Atualizar os campos do setor
    const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSector = e.target.value as Sector;
        setFormData({
            ...formData,
            sector: newSector,
            role: '' // Resetar o cargo quando mudar o setor
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    registration: formData.registration,
                    password: formData.password,
                    sector: formData.sector,
                    role: formData.role  // Adicionando o role aqui
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar usuário');
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : 'Erro ao criar usuário'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const sectors = [
        'Desenvolvimento',
        'Design',
        'Marketing',
        'RH',
        'Financeiro',
        'Comercial',
        'Suporte',
        'Geral'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Registrar Colaborador</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome Completo"
                            />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">E-mail Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="nome@empresa.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Matrícula</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="registration"
                                value={formData.registration}
                                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite a matrícula"
                            />
                        </div>
                        {errors.registration && <p className="text-red-500 text-sm mt-1">{errors.registration}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Setor</label>
                        <select
                            name="sector"
                            value={formData.sector}
                            onChange={handleSectorChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione um setor</option>
                            {Object.keys(sectorRoles).map((sector) => (
                                <option key={sector} value={sector}>
                                    {sector}
                                </option>
                            ))}
                        </select>
                        {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
                    </div>
                    {formData.sector && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Cargo</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione um cargo</option>
                                {sectorRoles[formData.sector as Sector].map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 pr-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite a senha"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Confirmar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="pl-10 pr-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirme a senha"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {errors.submit && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};