import { createServerClient } from "@supabase/ssr";

export const createClient = (context: any) => {
  return createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get: (key) => {
          const cookies = context.req.cookies;
          const cookie = cookies[key] ?? "";
          return decodeURIComponent(cookie);
        },
        set: (key, value, options) => {
          if (!context.res) return;
          context.res.cookie(key, encodeURIComponent(value), {
            ...options,
            sameSite: "Lax",
            httpOnly: true,
          });
        },
        remove: (key, options) => {
          if (!context.res) return;
          context.res.cookie(key, "", { ...options, httpOnly: true });
        },
      },
    }
  );
};
