import "server-only";
import { cookies } from "next/headers";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/app/_lib/amplify-server-utils";

/**
 * Returns the current Cognito user for use inside Server Components,
 * Server Actions, and Route Handlers.
 *
 * Throws if called from a Client Component (server-only import guard).
 * Returns null if no valid session exists instead of throwing, so callers
 * can decide how to handle the unauthenticated case without a try/catch.
 */
export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => cookieStore },
      operation: (ctx) => getCurrentUser(ctx),
    });
  } catch {
    return null;
  }
}

/**
 * Returns the full Cognito user attribute set (name, email, etc.).
 * Slightly more expensive than getAuthUser — only call it when you
 * need attributes beyond userId/username.
 */
export async function getAuthUserAttributes() {
  try {
    const cookieStore = await cookies();
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies: () => cookieStore },
      operation: (ctx) => fetchUserAttributes(ctx),
    });
  } catch {
    return null;
  }
}
