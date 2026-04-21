import crypto from "crypto";
import fs from "fs";

const { priviteKey, publicKey } = crypto.generateKeyPair("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

fs.writeFileSync("certs/private.pem", priviteKey);
fs.writeFileSync("certs/public.pem", publicKey);
