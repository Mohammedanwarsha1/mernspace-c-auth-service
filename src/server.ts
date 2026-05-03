import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, async () => {
            await AppDataSource.initialize();
            logger.info("Database connected successfully");
            console.log("welcome hi");
            logger.info("liserning on port", { port: PORT });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.info(err.message);
        }
        setTimeout(() => {
            process.exit(1);
        });
    }
};
startServer();
