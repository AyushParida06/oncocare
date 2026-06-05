import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

import { query } from "./_generated/server";
export const testPassword = query({
  args: {},
  handler: async () => {
    return {
      type: typeof Password,
      res: typeof Password === 'function' ? Password().id : null
    };
  }
});
