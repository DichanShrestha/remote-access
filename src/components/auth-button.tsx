'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AuthButton({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback?next=/dashboard`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return user ? (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
    >
      Sign Out
    </button>
  ) : (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
    >
      Continue with Google
    </button>
  )
}
