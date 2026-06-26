import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/app/_lib/amplify-server-utils";

export async function GET() {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (ctx) => getCurrentUser(ctx),
    });
    return NextResponse.json({ userId: user.userId, username: user.username });
  } catch {
    return NextResponse.json(null);
  }
}
