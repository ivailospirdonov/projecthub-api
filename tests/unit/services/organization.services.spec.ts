import { OrganizationRole } from "@prisma/client";
import crypto from "crypto";
import slugify from "slugify";
import { AppError } from "../../../src/errors/app-error";
import * as orgService from "../../../src/services/organization.services";
import { prisma } from "../../../src/utils/prisma";

jest.mock("slugify");
jest.mock("crypto");

const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedSlugify = slugify as unknown as jest.Mock;

describe("Organization Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrganization", () => {
    it("should create organization with unique slug", async () => {
      mockedSlugify.mockReturnValue("my-org");
      (prisma.organization.findUnique as jest.Mock)
        .mockResolvedValueOnce({}) // first slug exists
        .mockResolvedValueOnce(null); // second slug free
      (prisma.organization.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: "My Org",
        slug: "my-org-1",
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await orgService.createOrganization(1, "My Org");

      expect(prisma.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "My Org",
            slug: "my-org-1",
          }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.slug).toBe("my-org-1");
    });
  });

  describe("listUserOrganizations", () => {
    it("should return organizations for user", async () => {
      (prisma.organization.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: "Org 1" },
      ]);

      const result = await orgService.listUserOrganizations(1);

      expect(prisma.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            users: expect.objectContaining({ some: { userId: 1 } }),
          }),
        }),
      );
      expect(result.length).toBe(1);
    });
  });

  describe("inviteMember", () => {
    it("should throw if organization not found", async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orgService.inviteMember(
          1,
          "my-org",
          "test@example.com",
          OrganizationRole.MEMBER,
        ),
      ).rejects.toThrow(AppError);
    });

    it("should throw if inviter has insufficient permissions", async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        orgService.inviteMember(
          1,
          "my-org",
          "test@example.com",
          OrganizationRole.MEMBER,
        ),
      ).rejects.toThrow(AppError);
    });

    it("should create invitation with token", async () => {
      (prisma.organization.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "OWNER",
      });

      (mockedCrypto.randomBytes as jest.Mock).mockReturnValue(
        Buffer.from("1234567890abcdef"),
      );
      (prisma.invitation.create as jest.Mock).mockResolvedValue({
        id: 1,
        token: "31323334353637383930616263646566",
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await orgService.inviteMember(
        1,
        "my-org",
        "test@example.com",
        OrganizationRole.MEMBER,
      );

      expect(prisma.invitation.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.token).toBe("31323334353637383930616263646566");
    });
  });

  describe("acceptInvite", () => {
    it("should throw if invitation not found", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({
          invitation: { findUnique: jest.fn().mockResolvedValue(null) },
          userOrganization: { findUnique: jest.fn() },
          auditLog: { create: jest.fn() },
        });
      });

      await expect(orgService.acceptInvite(1, "token123")).rejects.toThrow(
        AppError,
      );
    });

    it("should accept invitation successfully", async () => {
      const mockTx = {
        invitation: {
          findUnique: jest.fn().mockResolvedValue({
            id: 1,
            organizationId: 1,
            status: "PENDING",
            role: "MEMBER",
            expiresAt: new Date(Date.now() + 1000),
          }),
          update: jest.fn().mockResolvedValue({
            id: 1,
            status: "ACCEPTED",
          }),
        },
        userOrganization: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockTx),
      );

      const result = await orgService.acceptInvite(1, "token123");

      expect(mockTx.userOrganization.create).toHaveBeenCalled();
      expect(mockTx.invitation.update).toHaveBeenCalled();
      expect(mockTx.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe("ACCEPTED");
    });
  });
});
