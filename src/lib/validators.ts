import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500),
  longDescription: z.string().optional(),
  category: z.enum(["cli-plugins", "lwc-library", "apex-utilities", "agentforce", "flow", "experience-cloud"]),
  installCommand: z.string().optional(),
  repositoryUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  npmUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  documentationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  iconEmoji: z.string().max(10).optional(),
  version: z.string().max(50).optional(),
  authorName: z.string().max(255).optional(),
  tagIds: z.array(z.string().uuid()).max(10).optional().default([]),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100),
});

export const reviewSchema = z.object({
  resourceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  body: z.string().max(2000).optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
