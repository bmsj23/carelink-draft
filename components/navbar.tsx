import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { HeartPulse, User } from 'lucide-react'
import { signout } from '@/app/login/actions'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">CareLink</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/book" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Find Doctors
              </Link>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <form action={signout}>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                    Sign Out
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
