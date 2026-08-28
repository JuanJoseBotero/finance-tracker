import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { db } from "@/lib/db"
import { transactions, goals } from "@/lib/db/schema"
import { isNull } from "drizzle-orm"

const trustedOrigins = [
  "http://localhost:3000",
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter((value): value is string => Boolean(value))

const productionTrustedOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter((value): value is string => Boolean(value))
  .map((value) => `https://${value}`)

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  trustedOrigins: process.env.NODE_ENV === "development" ? trustedOrigins : productionTrustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // 400 days is the maximum Max-Age browsers allow for a cookie. Combined
    // with a 1-day updateAge, the session's expiry rolls forward on every
    // request, so as long as the app is opened at least once a year the
    // session effectively never expires unless the user explicitly signs out.
    expiresIn: 60 * 60 * 24 * 400,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          // Claim any pre-existing, unowned data (transactions/goals created
          // before accounts existed) for the very first account that signs up.
          const [unownedTransaction] = await db
            .select({ id: transactions.id })
            .from(transactions)
            .where(isNull(transactions.userId))
            .limit(1)
          const [unownedGoal] = await db
            .select({ id: goals.id })
            .from(goals)
            .where(isNull(goals.userId))
            .limit(1)
          const hasUnownedData = Boolean(unownedTransaction || unownedGoal)

          if (!hasUnownedData) return

          await db
            .update(transactions)
            .set({ userId: createdUser.id })
            .where(isNull(transactions.userId))
          await db.update(goals).set({ userId: createdUser.id }).where(isNull(goals.userId))
        },
      },
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
