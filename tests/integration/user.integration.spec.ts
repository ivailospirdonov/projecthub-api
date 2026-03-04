import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../../src/services/auth.services";

describe("User API Integration", () => {
  let accessToken: string;
  let userId: number;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await prisma.user.create({
      data: {
        email: "profile@example.com",
        password: hashedPassword,
        name: "Initial Name",
      },
    });

    userId = user.id;

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "profile@example.com", password: "123456" });

    accessToken = loginRes.body.accessToken;
  });

  it("should get current user profile", async () => {
    const res = await request(app)
      .get("/api/v1/user")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("profile@example.com");
    expect(res.body.name).toBe("Initial Name");
    expect(res.body).not.toHaveProperty("password");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/v1/user");

    expect(res.status).toBe(401);
  });

  it("should return 404 if user does not exist", async () => {
    const fakeToken = generateAccessToken({ userId: 999999 });

    const res = await request(app)
      .get("/api/v1/user")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(404);
  });

  it("should update user profile", async () => {
    const res = await request(app)
      .patch("/api/v1/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");

    const userInDb = await prisma.user.findUnique({
      where: { id: userId },
    });

    expect(userInDb?.name).toBe("Updated Name");
  });

  it("should return 400 for invalid input", async () => {
    const res = await request(app)
      .patch("/api/v1/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "invalid-email" });

    expect(res.status).toBe(400);
  });
});
