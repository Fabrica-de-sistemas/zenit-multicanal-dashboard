import React, { useState, useEffect } from 'react';
import { Search, User, Shield, BarChart, Settings, Edit, Trash, UserPlus, Plus } from 'lucide-react';
import { UserCreateModal } from './UserCreateModal';
import { UserEditModal } from './UserEditModal';
import { adminService } from '@/services/adminService';
import SectorPermissionsManager from './SectorPermissionsManager';
import UserPermissionsManager from './UserPermissionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  sector: string;
}

const AdminSettings = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreationSuccess = () => {
    fetchUsers();
    setIsCreateModalOpen(false);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir usuário');
        }

        fetchUsers();
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        setError('Erro ao excluir usuário');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = selectedSectorFilter === 'all' || user.sector === selectedSectorFilter;

    return matchesSearch && matchesSector;
  });

  const renderUsersList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Gerenciar Usuários</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <UserPlus size={20} />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedSectorFilter}
            onChange={(e) => setSelectedSectorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Todos os Setores</option>
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

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Carregando usuários...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.sector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && !error && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedSectorFilter !== 'all'
                  ? 'Nenhum usuário encontrado com os filtros atuais'
                  : 'Nenhum usuário cadastrado'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPermissionsTabs = () => (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gerenciar Permissões</h2>
      <Tabs defaultValue="sectors">
        <TabsList>
          <TabsTrigger value="sectors" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Permissões por Setor</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Permissões por Usuário</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sectors">
          <SectorPermissionsManager />
        </TabsContent>

        <TabsContent value="users">
          <UserPermissionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="flex flex-1 h-full"> {/* Garante que o container ocupe o espaço */}
      {/* Botão para abrir o menu em telas pequenas */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="md:hidden absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Menu Lateral - Comportamento responsivo */}
      <div className={`
        w-full md:w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        absolute md:static inset-y-0 left-0 z-10
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Cabeçalho do Menu com botão de fechar */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
            <p className="text-sm text-gray-500 mt-1">Painel Admin</p>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="px-4 pb-4">
          <button
            onClick={() => { setActiveTab('users'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ...`}
          >
            <User size={20} />
            <span>Usuários</span>
          </button>

          <button
            onClick={() => { setActiveTab('permissions'); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ...`}
          >
            <Shield size={20} />
            <span>Permissões</span>
          </button>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'permissions' ? renderPermissionsTabs() : renderUsersList()}
      </div>

      {/* Modais */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreationSuccess}
      />

      {isEditModalOpen && selectedUser && (
        <UserEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            fetchUsers();
            setIsEditModalOpen(false);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default AdminSettings;