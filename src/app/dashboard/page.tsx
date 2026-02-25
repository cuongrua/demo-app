// d:\PROJECTS\demo-app\app\dashboard\page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardHomePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bài viết của tôi</h1>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600 mt-2">{post.content}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  post.published
                    ? 'bg-green-200 text-green-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}
              >
                {post.published ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </div>
          ))
        ) : (
          <p>Bạn chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  )
}
