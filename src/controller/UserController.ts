import { NextFunction, Request, Response } from "express";
import { CreateUserRequest } from "../types";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { Roles } from "../constants";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;

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
                role: Roles.MANAGER,
            });
            this.logger.info("Tenat has been created", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }
}
