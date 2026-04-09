import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import serviceRequestsRouter from "./service-requests";
import techniciansRouter from "./technicians";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(serviceRequestsRouter);
router.use(techniciansRouter);
router.use(dashboardRouter);

export default router;
