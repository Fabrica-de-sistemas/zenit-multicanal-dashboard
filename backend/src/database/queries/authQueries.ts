export const authQueries = {
  findByEmailOrRegistration: `
    SELECT * FROM users 
    WHERE email = ? OR registration = ?
  `,

  createUser: `
    INSERT INTO users (full_name, email, registration, password, role)
    VALUES (?, ?, ?, ?, ?)
  `,

  // Nova query para obter o último ID inserido
  getLastInsertId: `
    SELECT LAST_INSERT_ID() as id
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
};