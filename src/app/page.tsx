import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/landing/LandingPage'
import { cookies, headers } from 'next/headers'
import { getInitialPricingMode, PRICING_MODE_COOKIE } from '@/lib/pricing'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pageory — Turn Your Online Presence Into Opportunities',
  description: 'Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Pageory — Turn Your Online Presence Into Opportunities',
    description: 'Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.',
    url: 'https://pageory.app/',
  },
  twitter: {
    card: 'summary',
    title: 'Pageory — Turn Your Online Presence Into Opportunities',
    description: 'Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.',
  },
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()])
  const pricingMode = getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country'))
  return <LandingPage user={user} initialPricingMode={pricingMode} />
}
