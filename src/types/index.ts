import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export type ResourceCategory = "cli-plugins" | "lwc-library" | "apex-utilities";
export type ResourceStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";
