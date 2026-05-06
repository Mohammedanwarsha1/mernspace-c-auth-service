import { expressjwt } from "express-jwt";
import { Config } from "../config";
import type { Request } from "express";
import type { AuthCookie } from "../types";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
});
