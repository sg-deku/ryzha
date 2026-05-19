import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName } = await req.json()

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgName.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7),
      }
    })

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        organizationId: org.id,
        role: "ADMIN"
      }
    })

    return NextResponse.json({ message: "User created" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}
