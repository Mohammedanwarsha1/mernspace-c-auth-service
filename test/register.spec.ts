import request from "supertest";
import app from "../src/app";
import type { DataSource } from "typeorm/browser";
import { User } from "../src/entity/User";
import { AppDataSource } from "../src/config/data-source";
import { Roles } from "../src/constants";
import { isJwt } from "./utils";
import { RefreshToken } from "../src/entity/RefreshToken";
import { response } from "express";

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
        it("should return the access token and refresh token inside a cookie", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            let accessToken = null;
            let refreshToken = null;
            const setCookieHeader = response.headers["set-cookie"];
            const cookies = Array.isArray(setCookieHeader)
                ? setCookieHeader
                : setCookieHeader
                  ? [setCookieHeader]
                  : [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            console.log(accessToken);
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it("Should store refresh token in the database", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const refreshTokenRepository =
                connection.getRepository(RefreshToken);
            const tokens = await refreshTokenRepository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId= :userId ", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
        });
    });

    describe("Feild are missing", () => {
        it("should return 400 status code ,if email missing", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: "",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            console.log(response.body);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code ,if first name is missing", async () => {
            const userData = {
                firstName: "",
                lastName: "K",
                email: "anwar@gmail.com",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.statusCode).toBe(400);
        });
    });
    describe("Feilds are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "Rekesh",
                lastName: "K",
                email: " mohammedanwarsha2019@gmail.com ",
                password: "secret",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user?.email).toBe("mohammedanwarsha2019@gmail.com");
        });
    });
});
