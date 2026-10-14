import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/landing/LandingPage'
import { cookies, headers } from 'next/headers'
import { getInitialPricingMode, PRICING_MODE_COOKIE } from '@/lib/pricing'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()])
  const pricingMode = getInitialPricingMode(cookieStore.get(PRICING_MODE_COOKIE)?.value, requestHeaders.get('x-vercel-ip-country'))
  return <LandingPage user={user} initialPricingMode={pricingMode} />
}
