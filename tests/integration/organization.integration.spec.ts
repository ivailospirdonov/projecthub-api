import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/utils/prisma";

describe("Organization API Integration", () => {
  let ownerToken: string;
  let ownerId: number;

  beforeEach(async () => {
    const password = await bcrypt.hash("123456", 10);

    const owner = await prisma.user.create({
      data: {
        email: "owner@example.com",
        password,
      },
    });

    ownerId = owner.id;

    ownerToken = jwt.sign({ userId: owner.id }, process.env.JWT_ACCESS_SECRET!);
  });

  it("should create organization", async () => {
    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Test Org" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Org");
    expect(res.body.slug).toBe("test-org");

    const membership = await prisma.userOrganization.findFirst({
      where: { userId: ownerId },
    });

    expect(membership?.role).toBe("OWNER");

    const audit = await prisma.auditLog.findFirst({
      where: { userId: ownerId },
    });

    expect(audit).not.toBeNull();
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .post("/api/v1/organizations")
      .send({ name: "No Auth Org" });

    expect(res.status).toBe(401);
  });

  it("should list only user organizations", async () => {
    await request(app)
      .post("/api/v1/organizations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Org 1" });

    const res = await request(app)
      .get("/api/v1/organizations")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should invite member as OWNER", async () => {
    const org = await prisma.organization.create({
      data: {
        name: "Invite Org",
        slug: "invite-org",
        users: {
          create: {
            userId: ownerId,
            role: "OWNER",
          },
        },
      },
    });

    const res = await request(app)
      .post(`/api/v1/organizations/${org.slug}/invite`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: "member@example.com",
        role: "MEMBER",
      });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("member@example.com");

    const invitation = await prisma.invitation.findFirst({
      where: { email: "member@example.com" },
    });

    expect(invitation).not.toBeNull();
  });

  it("should reject invite if not admin or owner", async () => {
    const member = await prisma.user.create({
      data: {
        email: "member2@example.com",
        password: "pass",
      },
    });

    const memberToken = jwt.sign(
      { userId: member.id },
      process.env.JWT_ACCESS_SECRET!,
    );

    const org = await prisma.organization.create({
      data: {
        name: "Restricted Org",
        slug: "restricted-org",
        users: {
          createMany: {
            data: [
              { userId: ownerId, role: "OWNER" },
              { userId: member.id, role: "MEMBER" },
            ],
          },
        },
      },
    });

    const res = await request(app)
      .post(`/api/v1/organizations/${org.slug}/invite`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        email: "fail@example.com",
        role: "MEMBER",
      });

    expect(res.status).toBe(409);
  });

  function uniqueEmail(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random()}@example.com`;
  }

  it("should accept invitation", async () => {
    const ownerEmail = uniqueEmail("owner");
    const memberEmail = uniqueEmail("member");

    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
      },
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: ownerEmail, password: "password123" });

    expect(loginRes.status).toBe(200);
    const ownerToken = loginRes.body.accessToken;

    const orgRes = await request(app)
      .post("/api/v1/organizations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Test Organization" });

    expect(orgRes.status).toBe(201);

    const org = orgRes.body;

    const inviteRes = await request(app)
      .post(`/api/v1/organizations/${org.slug}/invite`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: memberEmail,
        role: "MEMBER",
      });

    expect(inviteRes.status).toBe(200);

    const invitation = inviteRes.body;

    const member = await prisma.user.create({
      data: {
        email: memberEmail,
        password: hashedPassword,
      },
    });

    const memberLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: memberEmail, password: "password123" });

    expect(memberLogin.status).toBe(200);
    const memberToken = memberLogin.body.accessToken;

    const acceptRes = await request(app)
      .post("/api/v1/organizations/accept-invite")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ token: invitation.token });

    expect(acceptRes.status).toBe(200);

    const membership = await prisma.userOrganization.findFirst({
      where: {
        userId: member.id,
        organizationId: org.id,
      },
    });

    expect(membership).not.toBeNull();
    expect(membership?.role).toBe("MEMBER");

    const updatedInvite = await prisma.invitation.findUnique({
      where: { id: invitation.id },
    });

    expect(updatedInvite?.status).toBe("ACCEPTED");
  });
});
