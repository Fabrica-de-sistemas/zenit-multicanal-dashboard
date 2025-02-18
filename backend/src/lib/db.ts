// src/lib/db.ts
import mysql, { Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '8478574823',
    database: process.env.DB_NAME || 'zenit',
});

// Teste de conexão
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erro ao conectar com o banco de dados:', err);
    });

// Tipos para o MySQL
export interface User extends RowDataPacket {
    id: string;
    full_name: string;
    email: string;
    registration: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

// Funções auxiliares mantidas para compatibilidade
export async function query<T extends RowDataPacket>(
    sql: string,
    params?: any[]
): Promise<T[]> {
    try {
        const [rows] = await pool.execute<T[]>(sql, params);
        return rows;
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
}

export async function execute(
    sql: string,
    params?: any[]
): Promise<ResultSetHeader> {
    try {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);
        return result;
    } catch (error) {
        console.error('Erro no execute:', error);
        throw error;
    }
}

export { RowDataPacket };