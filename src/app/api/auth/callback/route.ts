import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/db/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Sync user to Prisma
      let dbUser = await prisma.user.findUnique({
        where: { id: data.user.id },
        include: { profile: true }
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatarUrl: data.user.user_metadata?.avatar_url,
          },
          include: { profile: true }
        })
      }

      if (!dbUser.profile) {
        // Auto-create a profile for the user
        const baseUsername = (data.user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '')
        let username = baseUsername
        let counter = 1
        
        while (true) {
          const existing = await prisma.profile.findUnique({ where: { username } })
          if (!existing) break
          username = `${baseUsername}${counter}`
          counter++
        }

        const profile = await prisma.profile.create({
          data: {
            userId: data.user.id,
            username,
            displayName: dbUser.name || 'User',
            type: 'CREATOR',
          }
        })

        await prisma.page.create({
          data: {
            profileId: profile.id,
            draftConfig: {},
          }
        })
      }

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`)
}
