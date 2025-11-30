import { pgTable, text, varchar, integer, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles for the ERP system
export type UserRole = 'superadmin' | 'admin' | 'reception' | 'staff';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Profiles table (users/employees)
export const profiles = pgTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<UserRole>().notNull().default('staff'),
  colorCode: text("color_code").default('#3B82F6'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Service categories table
export const serviceCategories = pgTable("services_categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

// Services table (catalog)
export const services = pgTable("services", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Price in DA
  duration: integer("duration").notNull(), // Duration in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Staff skills table (linking employees to service categories)
export const staffSkills = pgTable("staff_skills", {
  profileId: varchar("profile_id", { length: 36 }).notNull(),
  categoryId: integer("category_id").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.profileId, table.categoryId] }),
}));

export const insertStaffSkillSchema = createInsertSchema(staffSkills);

export type InsertStaffSkill = z.infer<typeof insertStaffSkillSchema>;
export type StaffSkill = typeof staffSkills.$inferSelect;

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  clientId: varchar("client_id", { length: 36 }).notNull(),
  staffId: varchar("staff_id", { length: 36 }).notNull(),
  serviceId: varchar("service_id", { length: 36 }).notNull(),
  status: text("status").$type<AppointmentStatus>().notNull().default('pending'),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Extended types for frontend use
export interface ProfileWithSkills extends Profile {
  skills: number[]; // category IDs
}

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

export interface AppointmentWithDetails extends Appointment {
  client: Client;
  staff: Profile;
  service: ServiceWithCategory;
}

// Dashboard KPI types
export interface DashboardKPIs {
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
  appointmentsToday: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
}

export interface TopEmployee {
  id: string;
  name: string;
  colorCode: string;
  revenue: number;
  appointmentsCount: number;
}

export interface TopService {
  id: string;
  name: string;
  categoryName: string;
  count: number;
  revenue: number;
}

export interface GoldenClient {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  appointmentsCount: number;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  colorCode: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Legacy user table (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
