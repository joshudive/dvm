'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()

  // Hide footer on administrative routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-white/50 dark:bg-black/20 border-t py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b pb-12 mb-12 border-muted">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">DivineMercy</span>
          </div>

          <div className="flex gap-12">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/#leaderboard" className="hover:text-primary transition-colors text-muted-foreground font-medium">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-primary transition-colors text-muted-foreground font-medium">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors text-muted-foreground font-medium">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Admin</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/admin/login" className="hover:text-primary transition-colors text-muted-foreground font-medium">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-primary transition-colors text-muted-foreground font-medium">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} DivineMercy Voting Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
