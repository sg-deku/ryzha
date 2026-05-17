import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

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
          include: { organization: true }
        })
        if (!user) return null
        // In a real scenario you'd have a hashed password field.
        // For now, accept any non‑empty password (MVP).
        if (credentials.password.length < 1) return null
        return { id: user.id, email: user.email, name: user.name, organizationId: user.organizationId }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as any).organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).organizationId = token.organizationId as string
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}
