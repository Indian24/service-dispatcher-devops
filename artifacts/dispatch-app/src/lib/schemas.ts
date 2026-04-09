import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["customer", "technician"]),
});

export const createServiceRequestSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  serviceType: z.enum(["installation", "repair", "maintenance", "amc_service", "inspection"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  address: z.string().min(5, "Address is required"),
  scheduledAt: z.string().optional(),
});

export const updateServiceRequestSchema = z.object({
  status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]).optional(),
  technicianNotes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});
