import request from "supertest";
import app from "../src/app";
import type { DataSource } from "typeorm/browser";
import { User } from "../src/entity/User";
import { AppDataSource } from "../src/config/data-source";
import { Roles } from "../src/constants";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
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
        it("should assign a customer role", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0]?.role).toBe(Roles.CUSTOMER);
        });
        it("should assign hashed password to DB", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]?.password).not.toBe(userData.password);
            expect(users[0]?.password).toHaveLength(60);
            expect(users[0]?.password).toMatch(/^\$2[a|b]\$\d+\$/);
        });
        it("should return 400 status code if email already exist", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });
});
