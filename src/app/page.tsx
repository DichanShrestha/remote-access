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
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">B</div>
            BuilderStory
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Features</span>
            <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Pricing</span>
            <div className="pl-4 border-l border-gray-200">
              <AuthButton user={user} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            Introducing BuilderStory 2.0
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            The platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">indie builders</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create stunning profiles, list your startups, verify your revenue, and share your journey with the world. Built for the modern maker.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
                  ✓
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-lg">Welcome back, {dbUser?.name || user.email}</p>
                  <p className="text-gray-500 text-sm">You are successfully authenticated.</p>
                </div>
                <button className="mt-2 w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 w-full sm:w-auto">
                  Get Started for Free
                </button>
                <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200 shadow-sm w-full sm:w-auto">
                  View Examples
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to showcase your work</h2>
            <p className="text-lg text-gray-600">Powerful tools designed specifically for the indie hacker community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Revenue",
                desc: "Connect your Stripe account to display verified MRR badges on your profile.",
                icon: "💰"
              },
              {
                title: "Custom Domains",
                desc: "Host your BuilderStory profile on your own personal domain seamlessly.",
                icon: "🌐"
              },
              {
                title: "Beautiful Templates",
                desc: "Choose from dozens of premium templates that make your products shine.",
                icon: "✨"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-xs">B</div>
            <span className="font-bold text-gray-900">BuilderStory</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} BuilderStory. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
