'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Users, Vote, Trophy, ArrowRight, Image as ImageIcon, Search, TrendingUp, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/image-utils'

interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { status } = useSession()
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({ name: '', image: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchContestants()
    }
  }, [status])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const fetchContestants = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/contestants')
      if (res.ok) {
        const data = await res.json()
        setContestants(data)
      }
    } catch (err) {
      console.error('Failed to fetch contestants:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const res = await fetch(`/api/admin/contestants/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setContestants(contestants.filter((c) => c.id !== id))
        toast.success('Contestant deleted successfully')
      } else {
        toast.error('Failed to delete contestant')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(null)
      setIsDeleteDialogOpen(false)
      setSelectedContestant(null)
    }
  }

  const handleOpenEdit = (contestant: Contestant) => {
    setSelectedContestant(contestant)
    setEditFormData({
      name: contestant.name,
      image: contestant.image || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image is too large. Please select a file smaller than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string
        const compressed = await compressImage(base64, 600, 600, 0.7)
        setEditFormData({ ...editFormData, image: compressed })
        toast.success('Image loaded and compressed successfully')
      } catch (error) {
        console.error('Compression error:', error)
        setEditFormData({ ...editFormData, image: reader.result as string })
        toast.error('Failed to compress image')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContestant) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/contestants/${selectedContestant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (res.ok) {
        const updated = await res.json()
        setContestants(contestants.map(c => c.id === updated.id ? updated : c))
        toast.success('Contestant updated successfully')
        setIsEditDialogOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update contestant')
      }
    } catch (err) {
      console.error('Update failed:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredContestants = contestants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Contestants', value: contestants.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Votes Cast', value: contestants.reduce((acc, c) => acc + c.voteCount, 0), icon: Vote, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Current Leader', value: contestants.length > 0 ? contestants[0].name.split(' ')[0] : 'None', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 rounded-3xl border-muted bg-card shadow-sm hover:shadow-md transition-all border-none ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Contestants</h2>
            <p className="text-muted-foreground font-medium">Manage and monitor competition participants</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name..." 
                className="pl-10 h-11 rounded-xl bg-muted/30 border-muted focus:bg-card transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2" asChild>
              <Link href="/admin/contestants/new">
                <Plus className="w-4 h-4" />
                Add New Contestant
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredContestants.length === 0 ? (
          <Card className="p-16 text-center rounded-[2.5rem] border-dashed border-2 bg-muted/10">
            <div className="w-20 h-20 rounded-3xl bg-muted mx-auto mb-6 flex items-center justify-center">
              <Users className="text-muted-foreground w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">No contestants found</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Get started by adding your first contestant to the platform.</p>
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" asChild>
              <Link href="/admin/contestants/new">Create Contestant</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContestants.map((contestant) => (
              <Card
                key={contestant.id}
                className="group overflow-hidden rounded-3xl border-muted bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-none ring-1 ring-black/5 dark:ring-white/5"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden ring-1 ring-black/5">
                        {contestant.image ? (
                          <Image
                            src={contestant.image}
                            alt={contestant.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground truncate max-w-[150px]">
                          {contestant.name}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          ID: {contestant.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={() => {
                          setSelectedContestant(contestant)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={isDeleting === contestant.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 mb-4 border border-muted/50">
                    <div>
                      <p className="text-2xl font-black text-foreground tabular-nums">
                        {contestant.voteCount.toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Votes</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold bg-muted/10 border-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all gap-2"
                    onClick={() => handleOpenEdit(contestant)}
                  >
                    Edit Profile
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Contestant Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="p-8 bg-card">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                Edit <span className="text-primary">Contestant</span>
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Update details for {selectedContestant?.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="edit-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-image" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Profile Image
                </Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="edit-image"
                    className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    placeholder="Image URL or upload below"
                    disabled={isSubmitting}
                  />
                  <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0 overflow-hidden ring-1 ring-black/5">
                    {editFormData.image ? (
                      <Image
                        src={editFormData.image}
                        alt="Preview"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
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
                  className="w-full h-10 rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all gap-2 font-bold text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="w-4 h-4" />
                  Upload New Image
                </Button>
              </div>

              <DialogFooter className="pt-4 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl font-black shadow-lg shadow-primary/20 px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl sm:max-w-md">
          <div className="p-8 bg-card">
            <AlertDialogHeader className="mb-6">
              <AlertDialogTitle className="text-2xl font-black text-destructive flex items-center gap-2">
                Delete <span className="text-foreground">Contestant?</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-muted-foreground leading-relaxed">
                This will permanently remove <span className="font-bold text-foreground">{selectedContestant?.name}</span> from the platform. All associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="rounded-xl font-bold border-muted" disabled={isDeleting !== null}>
                Keep Contestant
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault()
                  if (selectedContestant) handleDelete(selectedContestant.id)
                }}
                className="rounded-xl font-black bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
                disabled={isDeleting !== null}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Permanently'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
