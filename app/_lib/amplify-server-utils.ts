import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import amplifyConfig from "./amplify-config";

// Amplify Gen 1 SSR Lambdas don't inject non-NEXT_PUBLIC_ vars into the runtime process env
// (only into the build process). NEXT_PUBLIC_ vars are baked into the server bundle at build
// time so they're always present in the Lambda. Bootstrap AMPLIFY_APP_ORIGIN from it here,
// before createServerRunner reads process.env.AMPLIFY_APP_ORIGIN.
if (!process.env.AMPLIFY_APP_ORIGIN && process.env.NEXT_PUBLIC_AMPLIFY_APP_ORIGIN) {
  process.env.AMPLIFY_APP_ORIGIN = process.env.NEXT_PUBLIC_AMPLIFY_APP_ORIGIN;
}

export const { runWithAmplifyServerContext, createAuthRouteHandlers } =
  createServerRunner({ config: amplifyConfig });
