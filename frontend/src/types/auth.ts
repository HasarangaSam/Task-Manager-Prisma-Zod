export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
