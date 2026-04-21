import { config } from "dotenv";
import path from "path";
config({ quiet: true });
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
} = process.env;

function required(value: string | undefined, name: string): string {
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export const Config = {
    PORT: parseInt(required(PORT, "PORT"), 10),
    NODE_ENV: required(NODE_ENV, "NODE_ENV"),

    DB_HOST: required(DB_HOST, "DB_HOST"),
    DB_PORT: parseInt(required(DB_PORT, "DB_PORT"), 10),
    DB_USERNAME: required(DB_USERNAME, "DB_USERNAME"),
    DB_PASSWORD: required(DB_PASSWORD, "DB_PASSWORD"),
    DB_NAME: required(DB_NAME, "DB_NAME"),
    REFRESH_TOKEN_SECRET: required(
        REFRESH_TOKEN_SECRET,
        "REFRESH_TOKEN_SECRET",
    ),
};
