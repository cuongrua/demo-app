// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({adapter});


async function main() {
  console.log('Bắt đầu seed dữ liệu...')

  // Hash passwords
  const hashedPasswordAdmin = await bcrypt.hash('securepassword123', 10)
  const hashedPasswordMember = await bcrypt.hash('memberpassword123', 10)

  // 1. Tạo Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { 
        id: randomUUID(),
        name: 'ADMIN' 
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { 
        id: randomUUID(),
        name: 'USER' },
  })

  console.log(`Đã tạo Roles: ${adminRole.name}, ${userRole.name}`)

  // 2. Tạo Users và gán Role
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPasswordAdmin,
      roleId: adminRole.id,
      posts: {
        create: [
          {
            
            id: randomUUID(),
            title: 'Bài viết quản trị đầu tiên',
            content: 'Nội dung bài viết quản trị...',
            published: true,
          },
        ],
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'member@example.com',
      name: 'Member User',
      password: hashedPasswordMember,
      roleId: userRole.id,
      posts: {
        create: [
          {
            id: randomUUID(),
            title: 'Xin chào cộng đồng',
            content: 'Tôi là thành viên mới.',
            published: true,
          },
          {
            id: randomUUID(),
            title: 'Bản nháp chưa đăng',
            content: 'Nội dung này chưa public.',
            published: false,
          },
        ],
      },
    },
  })

  console.log({ user1, user2 })
  console.log('Seed dữ liệu thành công!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
