import { createPublicKey } from "node:crypto";
import http from "node:http";
import https from "node:https";

type Jwk = {
    kid?: string;
    kty?: string;
    use?: string;
};

type JwksPayload = {
    keys?: Jwk[];
};

function getJson<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const transport = parsedUrl.protocol === "https:" ? https : http;

        const request = transport.get(parsedUrl, (response) => {
            if (!response.statusCode || response.statusCode >= 400) {
                reject(
                    new Error(
                        `Unable to fetch JWKS: ${response.statusCode ?? "unknown"}`,
                    ),
                );
                response.resume();
                return;
            }

            let body = "";
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
                body += chunk;
            });
            response.on("end", () => {
                try {
                    resolve(JSON.parse(body) as T);
                } catch (error) {
                    reject(error);
                }
            });
        });

        request.on("error", reject);
    });
}

function expressJwtSecret(options: { jwksUri: string }) {
    return async (_req: unknown, token: { header?: { kid?: string } }) => {
        const kid = token?.header?.kid;
        if (!kid) {
            throw new Error("Token header is missing kid");
        }

        const payload = await getJson<JwksPayload>(options.jwksUri);
        const jwk = payload.keys?.find(
            (key) => key.kid === kid && key.kty === "RSA" && key.use !== "enc",
        );

        if (!jwk) {
            throw new Error(`No matching JWK found for kid ${kid}`);
        }

        return createPublicKey({ key: jwk as JsonWebKey, format: "jwk" });
    };
}

const jwksClient = {
    expressJwtSecret,
};

export default jwksClient;
