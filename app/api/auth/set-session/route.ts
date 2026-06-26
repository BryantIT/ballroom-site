import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!;
const COOKIE_MAX_AGE = 31536000; // 1 year — matches Amplify's DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1];
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accessToken, idToken, refreshToken } = body as {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
  };

  if (!accessToken || !idToken) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const payload = decodeJwtPayload(accessToken);
  const username = payload["username"] as string | undefined;

  if (!username) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };

  const prefix = `CognitoIdentityServiceProvider.${CLIENT_ID}`;
  cookieStore.set(`${prefix}.${username}.accessToken`, accessToken, opts);
  cookieStore.set(`${prefix}.${username}.idToken`, idToken, opts);
  if (refreshToken) {
    cookieStore.set(`${prefix}.${username}.refreshToken`, refreshToken, opts);
  }
  cookieStore.set(`${prefix}.LastAuthUser`, username, opts);

  return NextResponse.json({ ok: true });
}
