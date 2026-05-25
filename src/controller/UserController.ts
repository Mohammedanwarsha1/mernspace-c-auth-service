import { NextFunction, Request, Response } from "express";
import {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from "../types";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import createHttpError from "http-errors";
import { matchedData, validationResult } from "express-validator";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password, tenantId, role } =
            req.body;

        if (tenantId === undefined) {
            return next(createHttpError(400, "tenantId is required."));
        }

        this.logger.debug("Request for creating a tenant", {
            firstName,
            lastName,
            email,
            password,
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            this.logger.info("Tenat has been created", { id: Number(user.id) });
            res.status(201).json({ id: Number(user.id) });
        } catch (err) {
            next(err);
        }
    }
    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }

        try {
            await this.userService.deleteById(Number(userId));

            this.logger.info("User has been deleted", {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, role, email, tenantId } = req.body;
        const userId = req.params.id;
        this.logger.debug("Request for creating a tenant", {
            firstName,
            lastName,
            role,
        });

        try {
            const user = await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
                email,
                tenantId,
            });
            this.logger.info("Tenat has been created", { id: userId });
            res.status(201).json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [users, count] = await this.userService.getAll(
                validatedQuery as UserQueryParams,
            );
            this.logger.info("All users have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }
    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }

        try {
            const user = await this.userService.findById(Number(userId));

            if (!user) {
                next(createHttpError(400, "User does not exist."));
                return;
            }

            this.logger.info("User has been fetched", { id: user.id });
            res.json(user);
        } catch (err) {
            next(err);
        }
    }
}
