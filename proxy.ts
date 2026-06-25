import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/app/_lib/amplify-server-utils";

// All routes that require a signed-in user
const protectedPaths = [
  "/dashboard",
  "/dances",
  "/practice",
  "/achievements",
  "/goals",
  "/competitions",
  "/reports",
  "/profile",
];

// Routes that should redirect authenticated users away (to the app)
const authPaths = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  // Skip session check for routes that don't need it
  if (!isProtected && !isAuthPath) return response;

  let isAuthenticated = false;
  try {
    isAuthenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec);
        return session.tokens !== undefined;
      },
    });
  } catch {
    isAuthenticated = false;
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the originally-requested path so we can redirect after sign-in
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.ico$).*)",
  ],
};
