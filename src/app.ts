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
import userRouter from "./routes/user";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorhandler.js";
const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    }),
);
app.disable("x-powered-by");

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
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

// Global Error Handler

app.use(globalErrorHandler);

export default app;
