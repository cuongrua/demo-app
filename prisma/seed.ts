// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
export const prisma = new PrismaClient({adapter});


async function main() {
  console.log('Bắt đầu seed dữ liệu...')

  // 1. Tạo Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  })

  console.log(`Đã tạo Roles: ${adminRole.name}, ${userRole.name}`)

  // 2. Tạo Users và gán Role
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'securepassword123', // Trong thực tế hãy hash password này
      roleId: adminRole.id,
      posts: {
        create: [
          {
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
      email: 'member@example.com',
      name: 'Member User',
      password: 'memberpassword123',
      roleId: userRole.id,
      posts: {
        create: [
          {
            title: 'Xin chào cộng đồng',
            content: 'Tôi là thành viên mới.',
            published: true,
          },
          {
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
