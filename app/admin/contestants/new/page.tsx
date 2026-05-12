'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, Image as ImageIcon, Loader2, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRef } from 'react'
import { compressImage } from '@/lib/image-utils'

export default function NewContestant() {
  const router = useRouter()
  const { status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  })

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Please select a file smaller than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string
        // Compress the image to max 600px width/height for database storage efficiency
        const compressed = await compressImage(base64, 600, 600, 0.7)
        setFormData({ ...formData, image: compressed })
        toast.success('Image loaded and compressed successfully')
      } catch (error) {
        console.error('Compression error:', error)
        setFormData({ ...formData, image: reader.result as string })
        toast.error('Failed to compress image, using original.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/admin/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Contestant created successfully')
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create contestant')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <AdminHeader />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
              Add New <span className="text-primary">Contestant</span>
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-muted-foreground font-medium mt-1">Enroll a new participant into the competition</p>
          </div>
        </div>

        <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  className="h-14 rounded-2xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-medium px-6"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="image" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Profile Image URL
                </Label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full space-y-4">
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      className="h-14 rounded-2xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium px-6"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                    
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
                      className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all gap-2 font-bold"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Upload from Device
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-2 ml-1">
                      Paste a URL above or upload a photo from your device (Max 2MB).
                    </p>
                  </div>
                  
                  <div className="w-32 h-32 rounded-3xl bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden flex-shrink-0 group relative">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        unoptimized
                        onError={() => toast.error('Invalid image URL')}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/40 text-[10px] font-black uppercase tracking-tighter">
                        <ImageIcon className="w-8 h-8" />
                        <span>Preview</span>
                      </div>
                    )}
                  </div>
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
                    <UserPlus className="w-6 h-6" />
                    Complete Enrollment
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
