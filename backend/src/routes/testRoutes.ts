import { Router } from "express";
import { testDatabase } from "../controllers/testController.js";

const router = Router();

router.get("/database", testDatabase);

export default router;
