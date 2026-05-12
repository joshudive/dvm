'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdminProfile() {
  const { data: session, update } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        // Update session data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            email: formData.email,
          },
        })
        setFormData(prev => ({ ...prev, password: '' }))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-[2.5rem] p-8 border-none ring-1 ring-black/5 dark:ring-white/5 shadow-xl bg-card overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
              </div>
              <Input
                className="h-14 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-primary" />
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
              </div>
              <Input
                type="email"
                className="h-14 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-primary" />
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
            </div>
            <Input
              type="password"
              placeholder="Leave blank to keep current password"
              className="h-14 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/25 gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          Update Admin Profile
        </Button>
      </form>
    </Card>
  )
}
