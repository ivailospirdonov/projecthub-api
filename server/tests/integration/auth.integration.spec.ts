import bcrypt from "bcrypt";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";

describe("Auth API Integration", () => {
  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");

    const userInDb = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    expect(userInDb).not.toBeNull();
  });

  it("should login an existing user", async () => {
    const hashed = await bcrypt.hash("123456", 10);
    await prisma.user.create({
      data: { email: "login@example.com", password: hashed },
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "login@example.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });
});
