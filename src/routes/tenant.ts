import express from "express";
import authenticate from "../middlewares/autheticate";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import { TenantService } from "../services/TenantService";
import { TenantController } from "../controller/TenantController";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { CreateTenantRequest } from "../types";
import { Roles } from "../constants";
import { canAccess } from "../middlewares/canAccess";

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await tenantController.create(
                req as CreateTenantRequest,
                res,
                next,
            );
        } catch (error) {
            next(error);
        }
    },
);

export default router;
