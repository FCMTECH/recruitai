
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      companyName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    companyName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    companyName: string;
  }
}
