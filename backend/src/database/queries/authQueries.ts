// backend\src\database\queries\authQueries.ts
export const authQueries = {
  findByEmailOrRegistration: `
    SELECT * FROM users 
    WHERE email = ? OR registration = ?
  `,

  createUser: `
    INSERT INTO users 
    (full_name, email, registration, password, role, sector)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  // Nova query para obter o último ID inserido
  getLastInsertId: `
    SELECT id FROM users 
    WHERE email = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `,

  findById: `
    SELECT 
      id, 
      full_name, 
      email, 
      role, 
      created_at, 
      updated_at 
    FROM users 
    WHERE id = ?
  `,


  findByEmail: `
    SELECT * FROM users 
    WHERE email = ?
  `,

  updateUserSector: `
    UPDATE users 
    SET sector = ? 
    WHERE id = ?
  `
};