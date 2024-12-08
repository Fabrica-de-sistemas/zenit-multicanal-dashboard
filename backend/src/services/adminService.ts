// backend/src/services/adminService.ts
import { query, execute } from '../lib/db';
import bcrypt from 'bcryptjs';

export const adminService = {
  async listUsers() {
    const users = await query(
      'SELECT id, full_name, email, role, sector, status FROM users ORDER BY full_name'
    );
    return users;
  },

  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const result = await execute(
      'INSERT INTO users (full_name, email, registration, password, role, sector, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.fullName, userData.email, userData.registration, hashedPassword, userData.role, userData.sector, 'active']
    );
    return { id: result.insertId, ...userData };
  },

  async updateUser(id: string, userData: any) {
    await execute(
      'UPDATE users SET full_name = ?, email = ?, role = ?, sector = ? WHERE id = ?',
      [userData.fullName, userData.email, userData.role, userData.sector, id]
    );
    return { id, ...userData };
  },

  async deleteUser(id: string) {
    await execute('DELETE FROM users WHERE id = ?', [id]);
  },

  async updateUserStatus(id: string, status: string) {
    await execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
    return user;
  },

  async updateUserRole(id: string, role: string) {
    await execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
    return user;
  },

  async listSectors() {
    const sectors = await query(`
      SELECT s.*, COUNT(u.id) as total_users 
      FROM sectors s 
      LEFT JOIN users u ON s.id = u.sector_id 
      GROUP BY s.id 
      ORDER BY s.name
    `);
    return sectors;
  },

  async createSector(sectorData: any) {
    const result = await execute(
      'INSERT INTO sectors (name) VALUES (?)',
      [sectorData.name]
    );
    return { id: result.insertId, ...sectorData };
  },

  async updateSector(id: string, sectorData: any) {
    await execute(
      'UPDATE sectors SET name = ? WHERE id = ?',
      [sectorData.name, id]
    );
    return { id, ...sectorData };
  },

  async deleteSector(id: string) {
    await execute('DELETE FROM sectors WHERE id = ?', [id]);
  }
};