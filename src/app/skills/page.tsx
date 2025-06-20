'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SkillCard } from '@/components/ui/skill-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Filter, Grid, List, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getSkills, hireSpecialist } from '@/lib/database'
import type { Skill, SearchFilters } from '@/types/database'

export default function SkillBoard() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [hiringSpecialist, setHiringSpecialist] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load skills from database
  const loadSkills = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await getSkills(filters, { page: 1, limit: 20 })

      if (dbError) {
        setError(dbError)
      } else {
        setSkills(data || [])
      }
    } catch (err) {
      setError('Failed to load skills. Please try again.')
      console.error('Error loading skills:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [filters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // For now, we'll implement text search by filtering the current results
    if (query.trim()) {
      const filtered = skills.filter(skill =>
        skill.skill_name.toLowerCase().includes(query.toLowerCase()) ||
        skill.skill_category.toLowerCase().includes(query.toLowerCase()) ||
        (skill.skill_sub_category && skill.skill_sub_category.toLowerCase().includes(query.toLowerCase()))
      )
      setSkills(filtered)
    } else {
      loadSkills() // Reload all skills if search is cleared
    }
  }

  const handleFilter = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    // The useEffect will trigger loadSkills with new filters
  }

  const handleHireSpecialist = async (skillId: string) => {
    if (!user) {
      setError('Please log in to hire specialists')
      return
    }

    try {
      setHiringSpecialist(skillId)
      setError(null)

      const { error: hireError } = await hireSpecialist(skillId, user.id)

      if (hireError) {
        setError(hireError)
      } else {
        setSuccessMessage('Hiring request sent successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError('Failed to send hiring request. Please try again.')
      console.error('Error hiring specialist:', err)
    } finally {
      setHiringSpecialist(null)
    }
  }

  const handleViewSkill = (skillId: string) => {
    // Navigate to skill details page (to be implemented)
    console.log('View skill:', skillId)
  }



  const getRandomRating = () => {
    return Math.random() * (5 - 4) + 4 // Random rating between 4.0 and 5.0
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">SkillBoard</h1>
            <p className="text-muted-foreground">
              Find talented specialists ready to bring your projects to life
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user && (
              <Button asChild>
                <Link href="/create/skill">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
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
            type="skill"
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
                  onClick={loadSkills}
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

        {/* Featured Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Web Development',
              'Graphic Design',
              'Content Writing',
              'Digital Marketing',
              'Mobile Development',
              'Data Analysis',
              'Video Editing',
              'Photography'
            ].map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading...' : `${skills.length} Specialists Available`}
            </h2>
            <Badge variant="outline">
              <Star className="h-3 w-3 mr-1" />
              {skills.filter(s => s.is_active).length} Active
            </Badge>
          </div>
          
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Sort by: Rating</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
            <option>Sort by: Experience</option>
            <option>Sort by: Latest</option>
          </select>
        </div>

        {/* Skills Grid/List */}
        {loading ? (
          <SkeletonGrid count={6} columns={3} />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onHire={handleHireSpecialist}
                onView={handleViewSkill}
                rating={getRandomRating()}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && skills.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Specialists
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && skills.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No specialists found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories.
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
