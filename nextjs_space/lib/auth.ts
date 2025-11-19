
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // OAuth Providers (apenas para candidatos)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "candidate", // OAuth sempre cria candidatos
          companyName: "",
        };
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "r_emailaddress r_liteprofile",
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "candidate", // OAuth sempre cria candidatos
          companyName: "",
        };
      },
    }),
    // Credentials Provider (para empresas e candidatos)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Por favor, verifique seu email antes de fazer login.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyName: user.companyName || "",
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // OAuth sign in (Google/LinkedIn)
      if (account && (account.provider === "google" || account.provider === "linkedin")) {
        if (!user.email) return false;
        
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email }
        });

        if (!existingUser) {
          // Create new user with candidate role
          const newUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              companyName: "",
              role: "candidate",
              image: user.image,
            }
          });

          // Create candidate profile with OAuth data
          await db.candidateProfile.upsert({
            where: { email: user.email },
            update: {
              fullName: user.name || "",
              photoUrl: user.image || undefined,
              linkedinUrl: account.provider === "linkedin" && profile ? (profile as any).publicProfileUrl : undefined,
            },
            create: {
              email: user.email,
              fullName: user.name || "",
              photoUrl: user.image || undefined,
              linkedinUrl: account.provider === "linkedin" && profile ? (profile as any).publicProfileUrl : undefined,
            }
          });
        } else {
          // Update candidate profile with latest OAuth data
          if (existingUser.role === "candidate") {
            await db.candidateProfile.upsert({
              where: { email: user.email },
              update: {
                fullName: user.name || existingUser.name || "",
                photoUrl: user.image || undefined,
              },
              create: {
                email: user.email,
                fullName: user.name || existingUser.name || "",
                photoUrl: user.image || undefined,
              }
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.role = user.role;
        token.companyName = user.companyName || "";
        token.logoUrl = (user as any).logoUrl || "";
      }
      // Support for updating session
      if (trigger === "update" && updateSession) {
        token.logoUrl = updateSession.logoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.role = (token.role as string) || "";
        session.user.companyName = (token.companyName as string) || "";
        (session.user as any).logoUrl = (token.logoUrl as string) || "";
      }
      return session;
    }
  }
};
