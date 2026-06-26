import { createAuthRouteHandlers } from "@/app/_lib/amplify-server-utils";

export const GET = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/",
});
