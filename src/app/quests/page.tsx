'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { QuestCard } from '@/components/ui/quest-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getQuests, applyToQuest } from '@/lib/database'
import type { Quest, SearchFilters } from '@/types/database'

export default function QuestBoard() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [applyingToQuest, setApplyingToQuest] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load quests from database
  const loadQuests = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await getQuests(filters, { page: 1, limit: 20 })

      if (dbError) {
        setError(dbError)
      } else {
        setQuests(data || [])
      }
    } catch (err) {
      setError('Failed to load quests. Please try again.')
      console.error('Error loading quests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuests()
  }, [filters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // For now, we'll implement text search by filtering the current results
    // In a production app, you'd want to do this server-side
    if (query.trim()) {
      const filtered = quests.filter(quest =>
        quest.title.toLowerCase().includes(query.toLowerCase()) ||
        quest.description.toLowerCase().includes(query.toLowerCase()) ||
        quest.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      setQuests(filtered)
    } else {
      loadQuests() // Reload all quests if search is cleared
    }
  }

  const handleFilter = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    // The useEffect will trigger loadQuests with new filters
  }

  const handleApplyToQuest = async (questId: string) => {
    if (!user) {
      setError('Please log in to apply to quests')
      return
    }

    try {
      setApplyingToQuest(questId)
      setError(null)

      const { error: applyError } = await applyToQuest(questId, user.id)

      if (applyError) {
        setError(applyError)
      } else {
        setSuccessMessage('Application submitted successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError('Failed to apply to quest. Please try again.')
      console.error('Error applying to quest:', err)
    } finally {
      setApplyingToQuest(null)
    }
  }

  const handleViewQuest = (questId: string) => {
    // Navigate to quest details page (to be implemented)
    console.log('View quest:', questId)
  }



  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">QuestBoard</h1>
            <p className="text-muted-foreground">
              Discover exciting quests and projects waiting for your skills
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user && (
              <Button asChild>
                <Link href="/create/quest">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Quest
                </Link>
              </Button>
            )}
            
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilter
            type="quest"
            onSearch={handleSearch}
            onFilter={handleFilter}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={loadQuests}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading...' : `${quests.length} Quests Available`}
            </h2>
            <Badge variant="outline">{quests.filter(q => q.status === 'open').length} Open</Badge>
          </div>
          
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Sort by: Latest</option>
            <option>Sort by: Price (High to Low)</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Deadline</option>
          </select>
        </div>

        {/* Quest Grid/List */}
        {loading ? (
          <SkeletonGrid count={6} columns={3} />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onApply={handleApplyToQuest}
                onView={handleViewQuest}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && quests.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Quests
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && quests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No quests found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
