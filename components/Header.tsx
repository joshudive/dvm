'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Trophy, UserCircle, Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Do not show public header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Leaderboard', href: '/#leaderboard' },
    { name: 'Contact Us', href: '/contact' },
  ]

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href.startsWith('/#')) {
      return pathname === '/' && typeof window !== 'undefined' && window.location.hash === href.substring(1)
    }
    return pathname === href
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass border-b transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                Divine<span className="text-primary">Mercy</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">
                Voting Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1 hover:text-primary",
                    active
                      ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="gap-2 font-bold rounded-xl border border-muted hover:bg-primary/5 hover:text-primary transition-all">
                <UserCircle className="w-4 h-4" />
                Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 rounded-xl border bg-muted/10 hover:bg-muted/20 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-20 bg-background/95 backdrop-blur-lg z-50 flex flex-col md:hidden transition-all duration-300 ease-in-out border-t",
          mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Navigation</p>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-xl font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-all",
                    active
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-5 h-5 opacity-50" />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile CTA */}
        <div className="p-6 border-t bg-muted/10">
          <Link href="/admin/login" className="w-full">
            <Button className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-xl shadow-primary/10">
              <UserCircle className="w-5 h-5" />
              Access Admin Portal
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
