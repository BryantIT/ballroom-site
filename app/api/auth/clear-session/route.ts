import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!;

export async function POST() {
  const cookieStore = await cookies();
  const prefix = `CognitoIdentityServiceProvider.${CLIENT_ID}`;

  const username = cookieStore.get(`${prefix}.LastAuthUser`)?.value;
  if (username) {
    cookieStore.delete(`${prefix}.${username}.accessToken`);
    cookieStore.delete(`${prefix}.${username}.idToken`);
    cookieStore.delete(`${prefix}.${username}.refreshToken`);
  }
  cookieStore.delete(`${prefix}.LastAuthUser`);
  cookieStore.delete("com.amplify.server_auth.pkce");
  cookieStore.delete("com.amplify.server_auth.state");

  return NextResponse.json({ ok: true });
}
