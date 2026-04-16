import app from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            logger.info("liserning on port", { port: PORT });
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
startServer();
