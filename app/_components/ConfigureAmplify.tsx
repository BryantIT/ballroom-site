"use client";

import { Amplify } from "aws-amplify";
import amplifyConfig from "@/app/_lib/amplify-config";

// Configure Amplify once on the client with SSR mode enabled so that
// auth tokens are stored in cookies (readable by the server) rather
// than localStorage (server-invisible).
Amplify.configure(amplifyConfig, { ssr: true });

export default function ConfigureAmplify() {
  return null;
}
