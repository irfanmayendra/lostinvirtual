import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  citizenId: text("citizen_id").unique().notNull(),
  nickname: text("nickname").notNull(),
  tier: text("tier").default("bronze").notNull(),
  cityId: text("city_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
