import cron from "node-cron";
import { prisma } from "./prisma";

/**
 *  Cleanup expired invitations and refresh tokens
 */
async function sendDailyDigest() {
  try {
    const users = await prisma.user.findMany({ select: { email: true } });
    for (const user of users) {
      console.log(`[Daily Digest] Mock email sent to ${user.email}`);
    }
  } catch (error) {
    console.error("[Daily Digest] Error:", error);
  }
}

/**
 *  Cleanup expired invitations and refresh tokens
 */
async function cleanupExpired() {
  try {
    const deletedInvitations = await prisma.invitation.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    console.log(
      `[Cleanup] Deleted ${deletedInvitations.count} expired invitations and ${deletedTokens.count} expired tokens`,
    );
  } catch (err) {
    console.error("[Cleanup] Error:", err);
  }
}

/**
 *  Recompute project statistics (tasks per status)
 */
async function recomputeProjectStats() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        name: true,
        tasks: true,
      },
    });

    for (const project of projects) {
      const stats = project.tasks.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log(`[Stats] Project ${project.name} stats:`, stats);
    }
  } catch (err) {
    console.error("[Stats] Error:", err);
  }
}

/**
 * Schedule all 3 jobs to run every day at midnight
 */
cron.schedule("0 0 * * *", async () => {
  console.log("=== Running scheduled daily jobs ===");
  await sendDailyDigest();
  await cleanupExpired();
  await recomputeProjectStats();
  console.log("=== Finished scheduled daily jobs ===");
});
