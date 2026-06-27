"use client";

import { Amplify } from "aws-amplify";

// Configure Amplify for client-side auth (email/password, getCurrentUser).
// OAuth is handled entirely server-side by createAuthRouteHandlers — omitting
// loginWith.oauth here prevents the client SDK from detecting the pending OAuth
// flow and trying to re-exchange an authorization code the server already consumed.
Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
        loginWith: { email: true },
      },
    },
  },
  { ssr: true }
);

export default function ConfigureAmplify() {
  return null;
}
