'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Loader2, Trophy, PencilLine, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRef } from 'react'

export default function EditContestant() {
  const router = useRouter()
  const params = useParams()
  const { status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    voteCount: 0,
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContestant()
    }
  }, [status, params.id])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Please select a file smaller than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string })
      toast.success('Image loaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const fetchContestant = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/contestants/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name,
          image: data.image || '',
          voteCount: data.voteCount,
        })
      } else {
        toast.error('Contestant not found')
        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
      toast.error('Failed to load contestant data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/contestants/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update contestant')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contestant? This action cannot be undone.')) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/contestants/${params.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Contestant deleted')
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (err) {
      toast.error('Failed to delete contestant')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <AdminHeader />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/admin/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Dashboard
          </Link>

          <Button 
            variant="ghost" 
            className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl gap-2 font-bold"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Contestant
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            Edit <span className="text-primary">Profile</span>
            <PencilLine className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Update details for {formData.name}</p>
        </div>

        <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Full Name
                </Label>
                <Input
                  id="name"
                  className="h-14 rounded-2xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-medium px-6"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="voteCount" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Current Votes
                  </Label>
                  <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                    <Input
                      id="voteCount"
                      type="number"
                      className="h-14 rounded-2xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-black text-xl pl-12"
                      value={formData.voteCount}
                      onChange={(e) => setFormData({ ...formData, voteCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-1">
                    Use this only for manual adjustments.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="image" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Profile Image URL
                  </Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="image"
                      className="h-14 rounded-2xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium px-6"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-muted flex-shrink-0 overflow-hidden ring-1 ring-black/5">
                      {formData.image ? (
                        <Image
                          src={formData.image}
                          alt="Preview"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all gap-2 font-bold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Change from Device
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/25 gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
