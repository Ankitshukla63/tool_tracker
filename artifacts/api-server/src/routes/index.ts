import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import toolsRouter from "./tools";
import transactionsRouter from "./transactions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(toolsRouter);
router.use(transactionsRouter);

export default router;
