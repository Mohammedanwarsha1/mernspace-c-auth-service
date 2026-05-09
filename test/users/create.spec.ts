import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { createTenant } from "../utils";

describe("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5501");
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });
    describe("Given all fields", () => {
        it("should persist user in the database", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.email).toBe(userData.email);
        });
        it("should create manager user", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0]?.role).toBe(Roles.MANAGER);
        });
    });
    it("should return 403,if non admin user tries to create user", async () => {
        const tenant = await createTenant(connection.getRepository(Tenant));
        const nonAdmin = jwks.token({
            sub: "1",
            role: Roles.MANAGER,
        });
        const userData = {
            firstName: "Rakesh",
            lastName: "K",
            email: "rakesh@mern.space",
            password: "password",
            tenantId: tenant.id,
        };
        const response = await request(app)
            .post("/users")
            .set("Cookie", [`accessToken=${nonAdmin}`])
            .send(userData);

        expect(response.statusCode).toBe(403);
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();

        expect(users).toHaveLength(0);
    });
});
