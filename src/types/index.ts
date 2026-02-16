import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    status?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      status?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
  }
}

export type ResourceCategory = "cli-plugins" | "lwc-library" | "apex-utilities" | "agentforce" | "flow" | "experience-cloud";
export type ResourceStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "banned";

export type FeatureFlagKey = "pro";
export type FeatureFlags = Record<FeatureFlagKey, boolean>;
