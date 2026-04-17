import request from "supertest";
import app from "../src/app";

describe("POST /auth/register", () => {
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
    });
});
