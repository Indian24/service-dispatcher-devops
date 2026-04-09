import { Router, type IRouter } from "express";
import { db, usersTable, serviceRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;

  const allUsers = await db.select({ id: usersTable.id, role: usersTable.role }).from(usersTable);
  const allRequests = await db.select().from(serviceRequestsTable);

  let requests = allRequests;
  if (user.role === "customer") {
    requests = allRequests.filter((r) => r.customerId === user.userId);
  } else if (user.role === "technician") {
    requests = allRequests.filter((r) => r.technicianId === user.userId);
  }

  const totalTechnicians = allUsers.filter((u) => u.role === "technician").length;
  const totalCustomers = allUsers.filter((u) => u.role === "customer").length;
  const activeTechnicians = (await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "technician"))).length;

  res.json({
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    inProgressRequests: requests.filter((r) => r.status === "in_progress" || r.status === "assigned").length,
    completedRequests: requests.filter((r) => r.status === "completed").length,
    totalTechnicians,
    totalCustomers,
    activeTechnicians,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;

  let rows = await db
    .select()
    .from(serviceRequestsTable)
    .orderBy(desc(serviceRequestsTable.updatedAt))
    .limit(10);

  if (user.role === "customer") {
    rows = rows.filter((r) => r.customerId === user.userId);
  } else if (user.role === "technician") {
    rows = rows.filter((r) => r.technicianId === user.userId);
  }

  const allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const result = rows.map((sr) => ({
    id: sr.id,
    title: sr.title,
    description: sr.description,
    serviceType: sr.serviceType,
    status: sr.status,
    priority: sr.priority,
    customerId: sr.customerId,
    technicianId: sr.technicianId,
    customerName: userMap.get(sr.customerId) ?? "Unknown",
    technicianName: sr.technicianId ? (userMap.get(sr.technicianId) ?? null) : null,
    address: sr.address,
    technicianNotes: sr.technicianNotes,
    scheduledAt: sr.scheduledAt,
    completedAt: sr.completedAt,
    createdAt: sr.createdAt,
    updatedAt: sr.updatedAt,
  }));

  res.json(result);
});

router.get("/dashboard/status-breakdown", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;

  let rows = await db.select().from(serviceRequestsTable);

  if (user.role === "customer") {
    rows = rows.filter((r) => r.customerId === user.userId);
  } else if (user.role === "technician") {
    rows = rows.filter((r) => r.technicianId === user.userId);
  }

  res.json({
    pending: rows.filter((r) => r.status === "pending").length,
    assigned: rows.filter((r) => r.status === "assigned").length,
    in_progress: rows.filter((r) => r.status === "in_progress").length,
    completed: rows.filter((r) => r.status === "completed").length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
  });
});

export default router;
