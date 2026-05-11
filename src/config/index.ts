import { config } from "dotenv";
import path from "node:path";

const env = process.env.NODE_ENV ?? "dev";
config({ quiet: true });
config({ path: path.join(process.cwd(), `.env.${env}`) });
process.env.NODE_ENV = env;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const {
    PORT,
    NODE_ENV,
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
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

    DATABASE_URL: DATABASE_URL
        ? required(DATABASE_URL, "DATABASE_URL")
        : undefined,

    DB_HOST: hasDatabaseUrl ? DB_HOST : required(DB_HOST, "DB_HOST"),
    DB_PORT: hasDatabaseUrl
        ? DB_PORT
            ? parseInt(DB_PORT, 10)
            : undefined
        : parseInt(required(DB_PORT, "DB_PORT"), 10),
    DB_USERNAME: hasDatabaseUrl
        ? DB_USERNAME
        : required(DB_USERNAME, "DB_USERNAME"),
    DB_PASSWORD: hasDatabaseUrl
        ? DB_PASSWORD
        : required(DB_PASSWORD, "DB_PASSWORD"),
    DB_NAME: hasDatabaseUrl ? DB_NAME : required(DB_NAME, "DB_NAME"),
    REFRESH_TOKEN_SECRET: required(
        REFRESH_TOKEN_SECRET,
        "REFRESH_TOKEN_SECRET",
    ),
    JWKS_URI: required(JWKS_URI, "JWKS_URI"),
    PRIVATE_KEY: required(PRIVATE_KEY, "PRIVATE_KEY"),
};
