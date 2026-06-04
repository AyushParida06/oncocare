export default {
  providers: [
    {
      // @ts-ignore
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
    {
      // @ts-ignore
      domain: process.env.SITE_URL || "http://localhost:3000",
      applicationID: "convex",
    },
  ],
};
