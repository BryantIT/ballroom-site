import type { NextRequest } from "next/server";
import { createAuthRouteHandlers } from "@/app/_lib/amplify-server-utils";

export const dynamic = "force-dynamic";

// Handler is created on first request so AMPLIFY_APP_ORIGIN is read at runtime,
// not during the build's module-evaluation phase where it may be absent.
let handler: ReturnType<typeof createAuthRouteHandlers> | undefined;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  handler ??= createAuthRouteHandlers({
    redirectOnSignInComplete: "/dashboard",
    redirectOnSignOutComplete: "/",
  });
  return handler(request, context as never);
}
