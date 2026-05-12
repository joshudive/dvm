'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Vote, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

interface Transaction {
  id: string
  contestantId: string
  voterEmail: string
  voterName?: string
  amount: number
  currency: string
  voteCount: number
  flutterRef?: string
  status: string
  voteApplied: boolean
  createdAt: string
  contestant: {
    name: string
    image?: string
  }
}

export default function AdminTransactions() {
  const router = useRouter()
  const { status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status, filter, page])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      params.append('limit', limit.toString())
      params.append('offset', ((page - 1) * limit).toString())

      const res = await fetch(`/api/admin/transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setTotal(data.total)
      }
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(t => 
    t.voterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contestant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.flutterRef?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Revenue', value: `${transactions[0]?.currency || 'NGN'} ${transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`, icon: Receipt, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Votes Processed', value: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.voteCount, 0).toLocaleString(), icon: Vote, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Success Rate', value: total > 0 ? `${Math.round((transactions.filter(t => t.status === 'completed').length / (transactions.length || 1)) * 100)}%` : '0%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-muted/50 text-muted-foreground border-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Transaction Ledger</h2>
            <p className="text-muted-foreground font-medium">Audit and monitor all payment activities across the platform</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl h-11 px-4 gap-2 font-bold border-muted">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 gap-2" onClick={fetchTransactions}>
              <ArrowUpDown className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 rounded-3xl border-none ring-1 ring-black/5 dark:ring-white/5 bg-card shadow-sm">
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

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {['all', 'completed', 'pending', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${
                  filter === s 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-card text-muted-foreground border-muted hover:bg-muted/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by email or contestant..." 
              className="pl-10 h-11 rounded-xl bg-muted/30 border-muted focus:bg-card transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Table */}
        <Card className="rounded-[2.5rem] overflow-hidden border-none ring-1 ring-black/5 shadow-xl bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-muted">
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Payer / Transaction</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Contestant</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Votes</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-12 h-12 text-muted-foreground/30 mb-2" />
                        <p className="font-bold text-muted-foreground">No transactions found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none mb-1">{tx.voterEmail}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">REF: {tx.flutterRef || tx.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden border border-muted ring-1 ring-black/5">
                            {tx.contestant.image ? (
                              <Image src={tx.contestant.image} alt={tx.contestant.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/50"><span className="text-xs opacity-30">👤</span></div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground leading-tight">{tx.contestant.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-black tabular-nums">{tx.currency} {tx.amount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-black tabular-nums">{tx.voteCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs font-bold whitespace-nowrap">{formatDate(tx.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && total > limit && (
            <div className="px-8 py-5 border-t border-muted bg-muted/20 flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground">
                Showing <span className="text-foreground">{((page - 1) * limit) + 1}</span> to <span className="text-foreground">{Math.min(page * limit, total)}</span> of <span className="text-foreground">{total}</span> records
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg h-9 w-9 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page * limit >= total} 
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg h-9 w-9 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
