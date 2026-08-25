import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Setup client with adapter for development seeding
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'developer@habittracker.com'
  const passwordHash = await bcrypt.hash('password123', 10)

  // Seed user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      timezone: 'Asia/Kolkata',
      habits: {
        create: [
          {
            name: 'Drink Water',
            description: 'Drink 3 liters of water throughout the day',
          },
          {
            name: 'Exercise',
            description: '30 minutes of jogging or gym workout',
          },
        ],
      },
    },
  })

  console.log(`Database seeded successfully.`)
  console.log(`Created user: ${user.email} with password: password123`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
