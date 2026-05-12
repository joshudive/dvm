import { useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'

export interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLeaderboard(initialData?: Contestant[]) {
  // Use SWR for periodic updates instead of expensive long-lived SSE
  const { data, error: swrError } = useSWR('/api/admin/contestants', fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
    fallbackData: initialData,
    revalidateOnFocus: true,
  })

  const [contestants, setContestants] = useState<Contestant[]>(data || initialData || [])
  const [isLoading, setIsLoading] = useState(!data && !initialData)
  const [error, setError] = useState<string | null>(null)

  // Sync state when SWR data changes, but preserve images if they aren't in the update
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setContestants(prev => {
        const updateMap = new Map(data.map((c: any) => [c.id, c]))
        
        const updated = prev.map(c => {
          const newData = updateMap.get(c.id)
          if (!newData) return c
          return {
            ...c,
            ...newData,
            // Keep the old image if the new data doesn't have it (for lazy loading optimization)
            image: newData.image || c.image 
          }
        })

        // Add any new contestants that weren't in the list
        const existingIds = new Set(prev.map(c => c.id))
        const newContestants = data.filter((c: any) => !existingIds.has(c.id))
        
        const finalList = [...updated, ...newContestants]
        return finalList.sort((a, b) => b.voteCount - a.voteCount)
      })
      setIsLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (swrError) {
      setError('Failed to refresh leaderboard')
    }
  }, [swrError])

  return { contestants, isLoading, error }
}
