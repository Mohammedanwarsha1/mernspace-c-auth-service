import fs from "node:fs";
import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import type { JwtPayload } from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import type { TokenService } from "../services/TokenService";
import type { CredentialService } from "../services/CredentialService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private CredentialService: CredentialService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "******",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (err) {
                const error = createHttpError(
                    500,
                    "Error while reading private",
                );
                next(error);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            //persisit the refresh token

            const refreshTokenRepository =
                this.tokenService.generateRefreshToken;
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        this.logger.debug("New request to login a user", {
            email,
            password: "******",
        });
        //Check email exist in database
        //Compare password
        //Add tokens to cookies
        //Return respose (id)

        try {
            const user = await this.userService.findbyEmail(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(error);
                return;
            }

            const passwordMatch = await this.CredentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            //persisit the refresh token

            const refreshTokenRepository =
                this.tokenService.generateRefreshToken;
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            this.logger.info("User has been logged in", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
