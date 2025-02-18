// backend\src\types\auth.ts
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  registration: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  token: string;
}