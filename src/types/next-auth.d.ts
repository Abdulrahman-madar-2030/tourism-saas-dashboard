import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    token?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      accessToken?: string;
      token?: string;
      role?: string;
      
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    token?: string;
    role?: string;
    email?: string;
    name?: string;
    isActive?: boolean;
    
  }
}
