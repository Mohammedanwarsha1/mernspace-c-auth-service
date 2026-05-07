import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from ".././src/config/data-source";
import app from ".././src/app";
import { Tenant } from ".././src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from ".././src/constants";

describe("POST /tenants", () => {
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
    it("should return 201 status code", async () => {
        const tenantdata = {
            name: "Tenant name",
            address: "tenant address",
        };
        const response = await request(app)
            .post("/tenant")
            .set("Cookie", [`accessToken=${adminToken}`])
            .send(tenantdata);

        const tenantRepository = connection.getRepository(Tenant);
        const tenant = await tenantRepository.find();
        expect(tenant).toHaveLength(1);
        expect(tenant[0]?.name).toBe(tenantdata.name);
        expect(tenant[0]?.address).toBe(tenantdata.address);
    });
});
