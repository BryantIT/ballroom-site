import type { ResourcesConfig } from "aws-amplify";

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        email: true,
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN!.split(","),
          redirectSignOut: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT!.split(","),
          responseType: "code",
        },
      },
    },
  },
};

export default amplifyConfig;
