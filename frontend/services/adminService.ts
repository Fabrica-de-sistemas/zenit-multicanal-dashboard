// frontend/services/adminService.ts
export const adminService = {
  async getUsers() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('http://localhost:8080/api/admin/users', {
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

async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:8080/api/admin/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();

      if (data.code === 'TOKEN_EXPIRED') {
        // Limpa os dados da sessão
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        // Redireciona para o login
        window.location.href = '/login';
        throw new Error('Sessão expirada, faça login novamente');
      }

      throw new Error(data.error || 'Erro ao buscar usuários');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  }
}