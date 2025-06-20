'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { QuestCard } from '@/components/ui/quest-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Plus, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function QuestBoard() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sample quest data for now
  const sampleQuests = [
    {
      id: '1',
      title: 'Website Development for Local Bakery',
      description: 'Need a professional website with online ordering system for my bakery business. Looking for someone experienced with e-commerce platforms.',
      pricing: 15000,
      start_date: '2025-07-01',
      end_date: '2025-07-15',
      start_time: '09:00',
      end_time: '17:00',
      tags: ['Web Development', 'E-commerce', 'Business'],
      location: 'Quezon City',
      status: 'open' as const,
      quest_owner_id: '1',
      created_at: '2025-06-20',
      updated_at: '2025-06-20',
      users: {
        first_name: 'Maria',
        last_name: 'Santos',
        profiles: [{
          profile_picture: '',
          location: 'Quezon City'
        }]
      }
    },
    {
      id: '2',
      title: 'Mobile App UI/UX Design',
      description: 'Looking for a talented designer to create modern and intuitive UI/UX for our fitness tracking mobile app.',
      pricing: 8000,
      start_date: '2025-06-25',
      end_date: '2025-07-10',
      start_time: '10:00',
      end_time: '18:00',
      tags: ['UI/UX Design', 'Mobile App', 'Fitness'],
      location: 'Makati City',
      status: 'open' as const,
      quest_owner_id: '2',
      created_at: '2025-06-19',
      updated_at: '2025-06-19',
      users: {
        first_name: 'John',
        last_name: 'Cruz',
        profiles: [{
          profile_picture: '',
          location: 'Makati City'
        }]
      }
    },
    {
      id: '3',
      title: 'Content Writing for Tech Blog',
      description: 'Need experienced tech writers to create engaging articles about AI, blockchain, and emerging technologies.',
      pricing: 2500,
      start_date: '2025-06-22',
      end_date: '2025-06-30',
      start_time: '09:00',
      end_time: '17:00',
      tags: ['Content Writing', 'Technology', 'AI', 'Blockchain'],
      location: 'Remote',
      status: 'open' as const,
      quest_owner_id: '3',
      created_at: '2025-06-18',
      updated_at: '2025-06-18',
      users: {
        first_name: 'Sarah',
        last_name: 'Lee',
        profiles: [{
          profile_picture: '',
          location: 'Manila'
        }]
      }
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setQuests(sampleQuests)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (query: string) => {
    console.log('Search:', query)
    // Implement search logic
  }

  const handleFilter = (filters: any) => {
    console.log('Filters:', filters)
    // Implement filter logic
  }

  const handleApply = (questId: string) => {
    console.log('Apply to quest:', questId)
    // Implement apply logic
  }

  const handleView = (questId: string) => {
    console.log('View quest:', questId)
    // Navigate to quest details
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
                onApply={handleApply}
                onView={handleView}
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
