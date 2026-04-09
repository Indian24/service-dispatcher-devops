import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const serviceTypeEnum = pgEnum("service_type", [
  "installation",
  "repair",
  "maintenance",
  "amc_service",
  "inspection",
]);

export const statusEnum = pgEnum("status", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  status: statusEnum("status").notNull().default("pending"),
  priority: priorityEnum("priority").notNull().default("medium"),
  customerId: integer("customer_id")
    .notNull()
    .references(() => usersTable.id),
  technicianId: integer("technician_id").references(() => usersTable.id),
  address: text("address").notNull(),
  technicianNotes: text("technician_notes"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
