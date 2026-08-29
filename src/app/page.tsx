import { createClient } from '@/lib/supabase/server'
import { AuthButton } from '@/components/auth-button'
import prisma from '@/db/prisma'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let dbUser = null
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">BuilderStory</h1>
        <p className="text-center text-gray-600 max-w-lg">
          The public platform for indie builders to create profiles, list startups, verify revenue, and share their story.
        </p>
        
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
          {user ? (
            <>
              <p className="text-green-600 font-semibold">Authenticated!</p>
              <p className="text-gray-500">Welcome, {dbUser?.name || user.email}</p>
            </>
          ) : (
            <p className="text-gray-500">Sign in to get started.</p>
          )}
          
          <AuthButton user={user} />
        </div>
      </div>
    </main>
  )
}
