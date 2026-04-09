import { Router, type IRouter } from "express";
import { db, usersTable, serviceRequestsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  ListServiceRequestsQueryParams,
  GetServiceRequestParams,
  UpdateServiceRequestParams,
  UpdateServiceRequestBody,
  AssignTechnicianParams,
  AssignTechnicianBody,
  CreateServiceRequestBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatRequest(sr: typeof serviceRequestsTable.$inferSelect, customerName: string, technicianName: string | null) {
  return {
    id: sr.id,
    title: sr.title,
    description: sr.description,
    serviceType: sr.serviceType,
    status: sr.status,
    priority: sr.priority,
    customerId: sr.customerId,
    technicianId: sr.technicianId,
    customerName,
    technicianName,
    address: sr.address,
    technicianNotes: sr.technicianNotes,
    scheduledAt: sr.scheduledAt,
    completedAt: sr.completedAt,
    createdAt: sr.createdAt,
    updatedAt: sr.updatedAt,
  };
}

async function getEnrichedRequest(id: number) {
  const [sr] = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).limit(1);
  if (!sr) return null;

  const [customer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, sr.customerId)).limit(1);
  let technicianName: string | null = null;
  if (sr.technicianId) {
    const [tech] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, sr.technicianId)).limit(1);
    technicianName = tech?.name ?? null;
  }

  return formatRequest(sr, customer?.name ?? "Unknown", technicianName);
}

router.get("/service-requests", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListServiceRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const user = req.user!;
  let rows = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));

  if (user.role === "customer") {
    rows = rows.filter((r) => r.customerId === user.userId);
  } else if (user.role === "technician") {
    rows = rows.filter((r) => r.technicianId === user.userId);
  }

  if (parsed.data.status) {
    rows = rows.filter((r) => r.status === parsed.data.status);
  }

  if (parsed.data.technicianId) {
    rows = rows.filter((r) => r.technicianId === parsed.data.technicianId);
  }

  const allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const result = rows.map((sr) => formatRequest(
    sr,
    userMap.get(sr.customerId) ?? "Unknown",
    sr.technicianId ? (userMap.get(sr.technicianId) ?? null) : null,
  ));

  res.json(result);
});

router.post("/service-requests", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const parsed = CreateServiceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const user = req.user!;

  const [sr] = await db
    .insert(serviceRequestsTable)
    .values({
      ...parsed.data,
      customerId: user.userId,
      status: "pending",
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    })
    .returning();

  const [customer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
  res.status(201).json(formatRequest(sr, customer?.name ?? "Unknown", null));
});

router.get("/service-requests/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetServiceRequestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const sr = await getEnrichedRequest(params.data.id);
  if (!sr) {
    res.status(404).json({ message: "Service request not found" });
    return;
  }

  const user = req.user!;
  if (user.role === "customer" && sr.customerId !== user.userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  if (user.role === "technician" && sr.technicianId !== user.userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  res.json(sr);
});

router.patch("/service-requests/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateServiceRequestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const body = UpdateServiceRequestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ message: body.error.message });
    return;
  }

  const user = req.user!;
  const existing = await getEnrichedRequest(params.data.id);
  if (!existing) {
    res.status(404).json({ message: "Service request not found" });
    return;
  }

  if (user.role === "customer") {
    res.status(403).json({ message: "Customers cannot update service requests" });
    return;
  }
  if (user.role === "technician" && existing.technicianId !== user.userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const updateData: Record<string, unknown> = { ...body.data };
  if (body.data.status === "completed") {
    updateData.completedAt = new Date();
  }
  if (body.data.scheduledAt) {
    updateData.scheduledAt = new Date(body.data.scheduledAt);
  }

  await db
    .update(serviceRequestsTable)
    .set(updateData)
    .where(eq(serviceRequestsTable.id, params.data.id));

  const updated = await getEnrichedRequest(params.data.id);
  res.json(updated);
});

router.post("/service-requests/:id/assign", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AssignTechnicianParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const body = AssignTechnicianBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ message: body.error.message });
    return;
  }

  const [tech] = await db.select().from(usersTable).where(
    and(eq(usersTable.id, body.data.technicianId), eq(usersTable.role, "technician"))
  ).limit(1);

  if (!tech) {
    res.status(400).json({ message: "Technician not found" });
    return;
  }

  await db
    .update(serviceRequestsTable)
    .set({ technicianId: body.data.technicianId, status: "assigned" })
    .where(eq(serviceRequestsTable.id, params.data.id));

  const updated = await getEnrichedRequest(params.data.id);
  if (!updated) {
    res.status(404).json({ message: "Service request not found" });
    return;
  }

  res.json(updated);
});

export default router;
