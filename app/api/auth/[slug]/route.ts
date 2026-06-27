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
  try {
    handler ??= createAuthRouteHandlers({
      redirectOnSignInComplete: "/dashboard",
      redirectOnSignOutComplete: "/",
    });
    return await handler(request, context as never);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
