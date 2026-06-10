import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/client/runtime/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL || ''

  // PostgreSQL（Neon / Vercel Postgres 等）
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: dbUrl }),
    })
  }

  // SQLite（本地开发）
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
