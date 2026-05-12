'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import Image from 'next/image'
import { X } from 'lucide-react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
}

export function ImageModal({ isOpen, onClose, src, alt }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none sm:rounded-[2rem]">
        <div className="relative aspect-[4/5] sm:aspect-square w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            priority
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
