import express, {
    type NextFunction,
    type Request,
    type RequestHandler,
    type Response,
} from "express";
import { AuthController } from "../controller/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register-validators";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validators";
import { CredentialService } from "../services/CredentialService";
import type { AuthRequest, RegisterUserRequest } from "../types";
import autheticate from "../middlewares/autheticate";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post(
    "/register",
    registerValidators,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.register(
                req as RegisterUserRequest,
                res,
                next,
            );
        } catch (error) {
            next(error);
        }
    },
);
router.post(
    "/login",
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.login(req as RegisterUserRequest, res, next);
        } catch (error) {
            next(error);
        }
    },
);

router.get(
    "/self",
    autheticate as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.self(req as AuthRequest, res);
        } catch (error) {
            next(error);
        }
    },
);

export default router;
