import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Enter your name" },
      },
      async authorize(credentials) {
        const nameToUse = credentials?.name || "Guest User"

        // Find or create user
        let user = await prisma.user.findFirst({
          where: { email: `${nameToUse.toLowerCase().replace(/\s+/g, '')}@demo.local` }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: nameToUse,
              email: `${nameToUse.toLowerCase().replace(/\s+/g, '')}@demo.local`,
            }
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-guest-login-123",
  debug: process.env.NODE_ENV === "development",
}
