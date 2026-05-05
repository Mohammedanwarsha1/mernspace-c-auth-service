import request from "supertest";
import app from "../src/app";
import type { DataSource } from "typeorm";
import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../src/config/data-source";
import { User } from "../src/entity/User";
import { Roles } from "../src/constants";

describe("POST /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    // Do not destroy AppDataSource here because app-level repositories are shared across test files.

    describe("Given all fields", () => {
        it("should return status code 200", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            //Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            //Add token to cookie
            const reponse = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            expect((reponse.body as Record<string, string>).id).toBe(data.id);
        });
        it("should not return password field", async () => {
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            //Add token to cookie
            const reponse = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            console.log(reponse.body);
            expect(reponse.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });
    });
});
