import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies, headers } from "next/headers";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const rawEmail = credentials?.email?.trim().toLowerCase();
          const rawPassword = credentials?.password;

          if (!rawEmail || !rawPassword) {
            return null;
          }

          const baseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: rawEmail,
              password: rawPassword,
            }),
          });

          if (!res.ok) {
            console.error("Backend login failed with status:", res.status);
            return null;
          }

          const responseData = await res.json();
          const data = responseData?.data || responseData;
          const userData = data?.user || responseData?.user || data;

          if (userData) {
            // Safely forward Set-Cookie header (including jwt token) to the browser
            try {
              const rawCookies = typeof res.headers.getSetCookie === "function"
                ? res.headers.getSetCookie()
                : [res.headers.get("set-cookie")].filter((c): c is string => Boolean(c));

              if (rawCookies && rawCookies.length > 0) {
                const cookieStore = await cookies();
                rawCookies.forEach((cookieStr) => {
                  if (!cookieStr) return;
                  const parts = cookieStr.split(";").map((p) => p.trim());
                  const [nameValue, ...options] = parts;
                  const eqIdx = nameValue.indexOf("=");
                  if (eqIdx !== -1) {
                    const name = nameValue.substring(0, eqIdx).trim();
                    const value = nameValue.substring(eqIdx + 1).trim();

                    const maxAgeOpt = options.find((o) => o.toLowerCase().startsWith("max-age="));
                    const pathOpt = options.find((o) => o.toLowerCase().startsWith("path="));
                    const sameSiteOpt = options.find((o) => o.toLowerCase().startsWith("samesite="));
                    const httpOnly = options.some((o) => o.toLowerCase() === "httponly");
                    const secure = options.some((o) => o.toLowerCase() === "secure");

                    cookieStore.set(name, value, {
                      path: "/",
                      httpOnly: false,
                      secure: secure || process.env.NODE_ENV === "production",
                      sameSite: "lax",
                      maxAge: maxAgeOpt ? parseInt(maxAgeOpt.split("=")[1], 10) : 30 * 24 * 3600,
                    });
                  }
                });
              }
            } catch (err) {
              console.error("Cookie setting in authorize skipped:", err);
            }

            // Also extract JWT token for session / Bearer header compatibility
            let token =
              data?.token ||
              responseData?.token ||
              data?.accessToken ||
              responseData?.accessToken ||
              data?.jwt ||
              responseData?.jwt ||
              "";

            if (!token) {
              const rawCookies = typeof res.headers.getSetCookie === "function"
                ? res.headers.getSetCookie()
                : [res.headers.get("set-cookie")].filter((c): c is string => Boolean(c));

              for (const cookieStr of rawCookies) {
                const match = cookieStr && cookieStr.match(/(?:jwt|token|access_token)=([^;]+)/i);
                if (match && match[1]) {
                  token = match[1].trim();
                  break;
                }
              }
            }

            const userId = String(userData._id || userData.id || "");
            const userName = userData.name || "User";
            const userEmail = userData.email || rawEmail;
            const userRole = userData.role || "admin";
            const isActive = userData.isActive ?? true;

            return {
              id: userId,
              name: userName,
              email: userEmail,
              isActive,
              role: userRole,
              token: token,
            };
          }
        } catch (error) {
          console.error("Authorize error:", error);
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async redirect({ url, baseUrl }) {
      let siteUrl = baseUrl;
      try {
        const reqHeaders = await headers();
        const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
        const proto = reqHeaders.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
        if (host) {
          siteUrl = `${proto}://${host}`;
        }
      } catch {}

      const cleanBase = siteUrl.replace(/\/+$/, "");
      if (url.startsWith("/")) return `${cleanBase}${url}`;
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === new URL(cleanBase).origin) {
          return url;
        }
      } catch {}
      return cleanBase;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        accessToken: token.accessToken as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/",
    signOut: "/",
  },

  events: {
    async signOut({ token }) {
      try {
        const cookieStore = await cookies();
        cookieStore.delete("jwt");
        cookieStore.delete("token");
      } catch {}

      try {
        const baseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: token?.accessToken
            ? { Authorization: `Bearer ${token.accessToken}` }
            : {},
        }).catch(() => {});
      } catch (e) {
        console.error("SignOut error:", e);
      }
    },
  },
});

export { handler as GET, handler as POST };
