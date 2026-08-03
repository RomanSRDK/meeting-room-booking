export type User = {
  id: string;
  name: string;
  email: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  status: number;
  message: string;
  data: User;
};

export type LogoutResponse = {
  status: number;
  message: string;
};

export type CurrentUserResponse = {
  status: number;
  message: string;
  data: User;
};
