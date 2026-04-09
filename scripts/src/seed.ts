import bcrypt from "bcryptjs";
import { db, usersTable, serviceRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const techHash = await bcrypt.hash("tech123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.email, "admin@aquacare.com")).limit(1);
  if (existingAdmin.length > 0) {
    console.log("Data already seeded, skipping.");
    return;
  }

  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@aquacare.com",
    passwordHash: adminHash,
    role: "admin",
    phone: "9000000001",
    isActive: true,
  }).returning();

  const [tech1] = await db.insert(usersTable).values({
    name: "Ravi Kumar",
    email: "ravi@aquacare.com",
    passwordHash: techHash,
    role: "technician",
    phone: "9000000002",
    isActive: true,
  }).returning();

  const [tech2] = await db.insert(usersTable).values({
    name: "Suresh Patel",
    email: "suresh@aquacare.com",
    passwordHash: techHash,
    role: "technician",
    phone: "9000000003",
    isActive: true,
  }).returning();

  const [customer1] = await db.insert(usersTable).values({
    name: "Priya Sharma",
    email: "priya@example.com",
    passwordHash: customerHash,
    role: "customer",
    phone: "9000000004",
    isActive: true,
  }).returning();

  const [customer2] = await db.insert(usersTable).values({
    name: "Amit Singh",
    email: "amit@example.com",
    passwordHash: customerHash,
    role: "customer",
    phone: "9000000005",
    isActive: true,
  }).returning();

  await db.insert(serviceRequestsTable).values([
    {
      title: "RO Water Purifier Installation",
      description: "New RO system installation needed in the kitchen. 6-stage purifier.",
      serviceType: "installation",
      status: "completed",
      priority: "medium",
      customerId: customer1.id,
      technicianId: tech1.id,
      address: "42, Koramangala, Bangalore - 560034",
      technicianNotes: "Installation completed successfully. Replaced the existing tap. System is working perfectly.",
      scheduledAt: new Date("2026-04-01T10:00:00Z"),
      completedAt: new Date("2026-04-01T12:00:00Z"),
    },
    {
      title: "UV Filter Not Working",
      description: "The UV indicator light is off. Water may not be getting purified properly.",
      serviceType: "repair",
      status: "in_progress",
      priority: "high",
      customerId: customer1.id,
      technicianId: tech2.id,
      address: "42, Koramangala, Bangalore - 560034",
      technicianNotes: "UV lamp has burned out. Replacement ordered.",
      scheduledAt: new Date("2026-04-09T14:00:00Z"),
    },
    {
      title: "Annual Maintenance Service - AMC",
      description: "Yearly AMC service due. All filters to be replaced and system sanitized.",
      serviceType: "amc_service",
      status: "assigned",
      priority: "medium",
      customerId: customer2.id,
      technicianId: tech1.id,
      address: "15, Indiranagar, Bangalore - 560038",
      scheduledAt: new Date("2026-04-10T11:00:00Z"),
    },
    {
      title: "Low Water Pressure Issue",
      description: "Water output from purifier has reduced significantly over the past week.",
      serviceType: "repair",
      status: "pending",
      priority: "medium",
      customerId: customer2.id,
      address: "15, Indiranagar, Bangalore - 560038",
    },
    {
      title: "Water Quality Inspection",
      description: "Routine inspection requested before summer. TDS levels seem high.",
      serviceType: "inspection",
      status: "pending",
      priority: "low",
      customerId: customer1.id,
      address: "42, Koramangala, Bangalore - 560034",
    },
  ]);

  console.log("Seed complete!");
  console.log("---");
  console.log("Login credentials:");
  console.log("  Admin:     admin@aquacare.com / admin123");
  console.log("  Technician 1: ravi@aquacare.com / tech123");
  console.log("  Technician 2: suresh@aquacare.com / tech123");
  console.log("  Customer 1:   priya@example.com / customer123");
  console.log("  Customer 2:   amit@example.com / customer123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
