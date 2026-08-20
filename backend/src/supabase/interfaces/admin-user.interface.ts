export interface AdminUser {
  id: string;
  email: string;
}

export interface CreateAdminUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
