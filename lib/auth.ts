import { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

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
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { 
              organizations: {
                take: 1,
                include: { 
                  role: true 
                }
              }
            }
          })

          if (!user || !user.password) {
            return null
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            return null
          }

          const userOrg = user.organizations[0]
          
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            organizationId: userOrg?.organizationId || "",
            role: userOrg?.role?.name || "MEMBER"
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.organizationId = user.organizationId
        token.role = user.role
      }
      
      if (trigger === "update" && session?.organizationId) {
        token.organizationId = session.organizationId
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
