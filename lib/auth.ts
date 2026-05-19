import { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    organizationId: string
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
          console.log("--- START AUTHORIZE ---")
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }
          
          console.log("Searching user:", credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { 
              organizations: {
                take: 1,
                include: { organization: true }
              }
            }
          })

          if (!user) {
            console.log("User not found in DB")
            return null
          }
          
          if (!user.password) {
            console.log("User has no password set")
            return null
          }

          console.log("Comparing password...")
          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log("Password valid:", isValid)
          
          if (!isValid) {
            return null
          }

          const defaultOrg = user.organizations[0]?.organizationId
          console.log("Returning user object for org:", defaultOrg)

          const authUser = { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            organizationId: defaultOrg || "" 
          }
          
          console.log("AuthUser object prepared:", JSON.stringify(authUser))
          console.log("--- END AUTHORIZE SUCCESS ---")
          return authUser as any
        } catch (error: any) {
          console.error("DETAILED NextAuth Authorize Error:", error.message)
          console.error(error.stack)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as any).organizationId
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
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}
