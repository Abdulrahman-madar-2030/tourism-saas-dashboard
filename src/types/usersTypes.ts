import { Company } from "./companyTypes";

export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: User[];
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: "admin" | "manager" | "data-entry" | "user" | string;
  company?: string | Company;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserForm {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  company?: string;
  isActive?: boolean;
}