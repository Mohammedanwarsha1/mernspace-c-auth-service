import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { name, address } = req.body;

        this.logger.debug("Request for creating a tenant", { name, address });

        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenat has been created", { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }
    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url params"));
            return;
        }
        this.logger.debug("Request for updating a tenant", req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            this.logger.info("Tenant has been updated", { id: tenantId });
        } catch (error) {
            next(error);
        }
    }
    async getAll(req: CreateTenantRequest, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info("All tenant has been fetched");
            res.json(tenants);
        } catch (err) {
            next(err);
        }
    }
    async getOne(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const tenantId = Number(req.params.id);
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url params"));
            return;
        }
        try {
            const tenant = await this.tenantService.getById(tenantId);
            if (!tenant) {
                next(createHttpError(400, "Tenant id does not exits."));
                return;
            }
            this.logger.info("Get the Tenant with the id", { id: tenantId });
            res.send(tenant);
        } catch (error) {
            next(error);
        }
    }
}
