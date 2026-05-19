import { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    organizationId: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        // In a real scenario you'd have a hashed password field.
        // For now, accept any non‑empty password (MVP).
        if (credentials.password.length < 1) return null
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          organizationId: user.organizationId,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizationId = user.organizationId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}
