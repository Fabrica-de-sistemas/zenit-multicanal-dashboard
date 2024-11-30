// frontend/src/types/user.ts
export interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    sector: string;
    createdAt?: string;
    updatedAt?: string;
  }