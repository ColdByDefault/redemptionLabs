export interface User {
  id: string;
  username: string;
  email: string;
  enabledPlugins: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  enabledPlugins: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
