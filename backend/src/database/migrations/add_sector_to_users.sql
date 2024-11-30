-- backend/src/database/migrations/add_sector_to_users.sql
ALTER TABLE users 
ADD COLUMN sector VARCHAR(100) DEFAULT 'Geral' NOT NULL;