// frontend/services/adminService.ts
export const adminService = {
  async getUsers() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar usuários');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro detalhado:', error);
      throw new Error(error instanceof Error ? error.message : 'Falha ao buscar usuários');
    }
  }
};