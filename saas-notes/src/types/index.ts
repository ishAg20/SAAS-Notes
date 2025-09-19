export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  tenantId: string;
  tenant: Tenant;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  subscription: "FREE" | "PRO";
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  tenantId: string;
  tenantSlug: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
export interface CreateNoteRequest {
  title: string;
  content: string;
}
export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}
