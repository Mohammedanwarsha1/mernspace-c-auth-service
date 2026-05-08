import express from "express";
import authenticate from "../middlewares/autheticate";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import { canAccess } from "../middlewares/canAccess";
import { UserController } from "../controller/UserController";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.create(req as CreateUserRequest, res, next);
        } catch (error) {
            next(error);
        }
    },
);
router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.destroy(req, res, next),
);

export default router;
