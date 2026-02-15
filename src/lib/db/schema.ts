import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  decimal,
  uniqueIndex,
  primaryKey,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ─── Enums ─── */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "banned"]);
export const resourceCategoryEnum = pgEnum("resource_category", [
  "cli-plugins",
  "lwc-library",
  "apex-utilities",
  "agentforce",
  "flow",
  "experience-cloud",
]);
export const resourceStatusEnum = pgEnum("resource_status", [
  "pending",
  "approved",
  "rejected",
]);

/* ─── Users (extends Auth.js) ─── */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  bio: text("bio"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Auth.js: Accounts ─── */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

/* ─── Auth.js: Sessions ─── */
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/* ─── Auth.js: Verification Tokens ─── */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

/* ─── Resources ─── */
export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description"),
    category: resourceCategoryEnum("category").notNull(),
    installCommand: text("install_command"),
    repositoryUrl: text("repository_url"),
    npmUrl: text("npm_url"),
    documentationUrl: text("documentation_url"),
    iconEmoji: varchar("icon_emoji", { length: 10 }).default("📦").notNull(),
    version: varchar("version", { length: 50 }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: varchar("author_name", { length: 255 }),
    status: resourceStatusEnum("status").default("pending").notNull(),
    featured: boolean("featured").default(false).notNull(),
    avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
    reviewsCount: integer("reviews_count").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("resources_slug_idx").on(table.slug)]
);

/* ─── Tags ─── */
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
});

/* ─── Resource <-> Tags (many-to-many) ─── */
export const resourceTags = pgTable(
  "resource_tags",
  {
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.resourceId, table.tagId] }),
  ]
);

/* ─── Reviews ─── */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 255 }),
    body: text("body"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("reviews_resource_user_idx").on(
      table.resourceId,
      table.userId
    ),
  ]
);

/* ─── Resource Screenshots ─── */
export const resourceScreenshots = pgTable("resource_screenshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: text("public_id").notNull(),
  alt: varchar("alt", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Invitations ─── */
export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Site Settings (single-row config) ─── */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  requireApproval: boolean("require_approval").default(true).notNull(),
  heroWords: text("hero_words"),
  emailWelcome: boolean("email_welcome").default(true).notNull(),
  emailSubmissionReceived: boolean("email_submission_received").default(true).notNull(),
  emailSubmissionApproved: boolean("email_submission_approved").default(true).notNull(),
  emailSubmissionRejected: boolean("email_submission_rejected").default(true).notNull(),
  emailAdminAlert: boolean("email_admin_alert").default(true).notNull(),
  emailUserSuspended: boolean("email_user_suspended").default(true).notNull(),
  emailUserBanned: boolean("email_user_banned").default(true).notNull(),
  emailUserRestored: boolean("email_user_restored").default(true).notNull(),
});

/* ─── Page Views (Analytics) ─── */
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    path: varchar("path", { length: 512 }).notNull(),
    referrer: varchar("referrer", { length: 1024 }),
    visitorId: varchar("visitor_id", { length: 36 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    category: resourceCategoryEnum("category"),
    resourceId: uuid("resource_id").references(() => resources.id, {
      onDelete: "set null",
    }),
    durationSeconds: integer("duration_seconds").default(0),
    viewedAt: timestamp("viewed_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("page_views_viewed_at_idx").on(table.viewedAt),
    index("page_views_path_idx").on(table.path),
    index("page_views_category_idx").on(table.category),
    index("page_views_user_id_idx").on(table.userId),
  ]
);

/* ─── Type exports ─── */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type ResourceScreenshot = typeof resourceScreenshots.$inferSelect;
export type NewResourceScreenshot = typeof resourceScreenshots.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
