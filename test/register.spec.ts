import request from "supertest";
import app from "../src/app";
import type { DataSource } from "typeorm/browser";
import { User } from "../src/entity/User";
import { AppDataSource } from "../src/config/data-source";
import { trucateTables } from "./utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
    });

    beforeEach(async () => {
        await trucateTables(connection);
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all feilds", () => {
        it("should return 201 status code", async () => {
            //Arrange

            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        });
        it("should return json", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should return id of created user", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.body).toHaveProperty("id");
            expect(typeof response.body.id).toBe("number");
        });
        it("should persist in the database", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0]?.firstName).toBe(userData.firstName);
            expect(users[0]?.lastName).toBe(userData.lastName);
            expect(users[0]?.email).toBe(userData.email);
        });
    });
});
