// frontend/types/user.ts
import { Permission } from '@/config/permissions';

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    sector: string;
    permissions?: Permission[];
}