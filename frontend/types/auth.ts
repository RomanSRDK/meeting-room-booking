export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type CurrentUserResponse = {
  status: number;
  message: string;
  data: User;
};
