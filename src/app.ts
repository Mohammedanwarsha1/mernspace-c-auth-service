import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";

import { error } from "node:console";
import authRouter from "./routes/auth";
const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
    res.send("Welcome to auth service");
});

app.use("/auth", authRouter);

// Global Error Handler

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

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
