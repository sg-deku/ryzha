const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'rhyza-hq' },
    update: {},
    create: {
      name: 'Rhyza HQ',
      slug: 'rhyza-hq',
      plan: 'FREE',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'admin@rhyza.com' },
    update: {},
    create: {
      email: 'admin@rhyza.com',
      name: 'Admin User',
      organizationId: org.id,
      role: 'ADMIN',
    },
  })

  console.log('Seeded successfully:', { org, user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
