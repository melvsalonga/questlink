'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { SkillCard } from '@/components/ui/skill-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Plus, Filter, Grid, List, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function SkillBoard() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  // Sample skill data for now
  const sampleSkills = [
    {
      id: '1',
      skill_name: 'React Development',
      skill_category: 'Web Development',
      skill_sub_category: 'Frontend',
      proficiency: 'advanced' as const,
      pricing: 750,
      time_cost_per_hour: 60,
      is_active: true,
      user_id: '1',
      created_at: '2025-06-20',
      updated_at: '2025-06-20',
      users: {
        first_name: 'John',
        last_name: 'Doe',
        profiles: [{
          profile_picture: '',
          location: 'Manila'
        }]
      }
    },
    {
      id: '2',
      skill_name: 'Graphic Design',
      skill_category: 'Design',
      skill_sub_category: 'Visual Design',
      proficiency: 'expert' as const,
      pricing: 600,
      time_cost_per_hour: 45,
      is_active: true,
      user_id: '2',
      created_at: '2025-06-19',
      updated_at: '2025-06-19',
      users: {
        first_name: 'Anna',
        last_name: 'Garcia',
        profiles: [{
          profile_picture: '',
          location: 'Quezon City'
        }]
      }
    },
    {
      id: '3',
      skill_name: 'Content Writing',
      skill_category: 'Writing',
      skill_sub_category: 'Technical Writing',
      proficiency: 'intermediate' as const,
      pricing: 400,
      time_cost_per_hour: 30,
      is_active: true,
      user_id: '3',
      created_at: '2025-06-18',
      updated_at: '2025-06-18',
      users: {
        first_name: 'Mike',
        last_name: 'Johnson',
        profiles: [{
          profile_picture: '',
          location: 'Makati City'
        }]
      }
    },
    {
      id: '4',
      skill_name: 'Python Programming',
      skill_category: 'Programming',
      skill_sub_category: 'Backend Development',
      proficiency: 'expert' as const,
      pricing: 900,
      time_cost_per_hour: 60,
      is_active: true,
      user_id: '4',
      created_at: '2025-06-17',
      updated_at: '2025-06-17',
      users: {
        first_name: 'Sarah',
        last_name: 'Chen',
        profiles: [{
          profile_picture: '',
          location: 'BGC, Taguig'
        }]
      }
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSkills(sampleSkills)
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

  const handleHire = (skillId: string) => {
    console.log('Hire specialist:', skillId)
    // Implement hire logic
  }

  const handleView = (skillId: string) => {
    console.log('View specialist:', skillId)
    // Navigate to specialist profile
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
                onHire={handleHire}
                onView={handleView}
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
