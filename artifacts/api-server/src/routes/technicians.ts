import { Router, type IRouter } from "express";
import { db, usersTable, serviceRequestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/technicians", requireAuth, async (_req, res): Promise<void> => {
  const technicians = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      phone: usersTable.phone,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .where(eq(usersTable.role, "technician"));

  const allJobs = await db.select().from(serviceRequestsTable);

  const result = technicians.map((tech) => {
    const techJobs = allJobs.filter((j) => j.technicianId === tech.id);
    const activeJobs = techJobs.filter((j) => j.status === "in_progress" || j.status === "assigned").length;
    return {
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      isActive: tech.isActive,
      totalJobs: techJobs.length,
      activeJobs,
    };
  });

  res.json(result);
});

export default router;
