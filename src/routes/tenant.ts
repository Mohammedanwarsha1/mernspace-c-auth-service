import express from "express";
import authenticate from "../middlewares/autheticate";

const router = express.Router();

router.post("/", (req, res) => {
    res.status(201).json({});
});

export default router;
