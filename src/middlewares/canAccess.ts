import type { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as unknown as AuthRequest;
        const roleFromRole = _req.auth.role;

        if (!roles.includes(roleFromRole)) {
            const error = createHttpError(
                403,
                "you don't have enough permission",
            );
            next(error);
            return;
        }
        next();
    };
};
