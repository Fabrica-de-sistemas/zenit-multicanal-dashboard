// src/lib/db.ts
import mysql, { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'zenit',
});

// Teste de conexão
pool.getConnection()
    .then(connection => {
        console.log('Conexão com o banco estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar com o banco:', err);
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

// Função para executar queries
export async function query<T extends RowDataPacket>(
    sql: string,
    params?: any[]
): Promise<T[]> {
    try {
        console.log('\n==== EXECUTANDO QUERY ====');
        console.log('SQL:', sql);
        console.log('Parâmetros:', params);

        const [rows] = await pool.execute<T[]>(sql, params);

        console.log('Resultado:', {
            quantidadeRegistros: Array.isArray(rows) ? rows.length : 'N/A',
            primeiroRegistro: Array.isArray(rows) && rows.length > 0 ?
                { ...rows[0], password: rows[0].password ? '[PROTEGIDO]' : undefined } :
                'Nenhum registro encontrado'
        });
        console.log('==== QUERY FINALIZADA ====\n');

        return rows;
    } catch (error) {
        console.error('\n❌ ERRO NA QUERY ❌');
        console.error('SQL:', sql);
        console.error('Parâmetros:', params);
        console.error('Erro:', error);
        throw error;
    }
}

export async function execute(
    sql: string,
    params?: any[]
): Promise<ResultSetHeader> {
    try {
        console.log('\n==== EXECUTANDO COMANDO SQL ====');
        console.log('SQL:', sql);
        console.log('Parâmetros:', params?.map(p =>
            typeof p === 'string' && p.startsWith('$2b$') ? '[HASH]' : p
        ));

        const [result] = await pool.execute<ResultSetHeader>(sql, params);

        console.log('Resultado:', {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        });
        console.log('==== COMANDO FINALIZADO ====\n');

        return result;
    } catch (error) {
        console.error('\n❌ ERRO NO COMANDO SQL ❌');
        console.error('SQL:', sql);
        console.error('Parâmetros:', params);
        console.error('Erro:', error);
        throw error;
    }
}