import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
const app = express();

// Serve .well-known directory for JWKS
const publicDir = path.resolve(process.cwd(), "public");
app.use(
    "/.well-known",
    express.static(path.join(publicDir, ".well-known"), {
        dotfiles: "allow",
    }),
);
app.use(express.static(publicDir));
app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
    res.send("Welcome to auth service");
});

app.use("/auth", authRouter);
app.use("/tenant", tenantRouter);

// Global Error Handler

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    console.log(err);
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
