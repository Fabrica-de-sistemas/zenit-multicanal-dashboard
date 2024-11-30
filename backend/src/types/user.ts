// backend/src/types/user.ts
export interface User {
    id: string;
    fullName: string;
    email: string;
    registration: string;
    role: string;
    sector: string;
    password: string;
    created_at?: Date;
    updated_at?: Date;
  }