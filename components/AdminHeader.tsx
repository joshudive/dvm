'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Trophy, LayoutDashboard, Settings, LogOut, User, Menu } from 'lucide-react'

export function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">Admin<span className="text-primary">Panel</span></h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">DivineMercy Platform</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-xl border">
            <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 px-4 font-bold text-sm">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="rounded-lg h-9 px-4 font-bold text-sm">
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-muted bg-card shadow-sm hover:bg-muted/10 font-bold h-10 px-4 gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">{session?.user?.name || session?.user?.email?.split('@')[0] || 'Administrator'}</span>
                  <Menu className="w-4 h-4 text-muted-foreground ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-muted">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account</p>
                  <p className="text-sm font-bold truncate">{session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-primary/5 focus:text-primary font-bold">
                  <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer focus:bg-primary/5 focus:text-primary font-bold">
                  <Link href="/admin/settings" className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-lg h-10 cursor-pointer focus:bg-destructive/5 text-destructive font-bold flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
