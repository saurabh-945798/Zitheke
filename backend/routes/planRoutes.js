import express from "express";
import { listPlans, getPlanBySlug } from "../Controllers/planController.js";
import { validate } from "../middlewares/validate.js";
import { planSlugParamSchema } from "../schemas/plan.schema.js";

const router = express.Router();

router.get("/", listPlans);
router.get("/:slug", validate(planSlugParamSchema, "params"), getPlanBySlug);

export default router;
