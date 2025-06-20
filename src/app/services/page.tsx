'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { ServiceCard } from '@/components/ui/service-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Filter, Grid, List, Building, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getServices } from '@/lib/database'
import type { Service, SearchFilters } from '@/types/database'

export default function ServicesPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [contactingProvider, setContactingProvider] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load services from database
  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await getServices(filters, { page: 1, limit: 20 })

      if (dbError) {
        setError(dbError)
      } else {
        setServices(data || [])
      }
    } catch (err) {
      setError('Failed to load services. Please try again.')
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [filters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // For now, we'll implement text search by filtering the current results
    if (query.trim()) {
      const filtered = services.filter(service =>
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.category_tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      setServices(filtered)
    } else {
      loadServices() // Reload all services if search is cleared
    }
  }

  const handleFilter = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    // The useEffect will trigger loadServices with new filters
  }

  const handleContactProvider = async (serviceId: string) => {
    if (!user) {
      setError('Please log in to contact service providers')
      return
    }

    // For now, just show a success message
    // In a real app, you'd implement a messaging system or contact form
    setSuccessMessage('Contact feature coming soon! For now, you can view the service details.')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleViewService = (serviceId: string) => {
    // Navigate to service details page (to be implemented)
    console.log('View service:', serviceId)
  }



  const getRandomRating = () => {
    return Math.random() * (5 - 3.5) + 3.5 // Random rating between 3.5 and 5.0
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Services</h1>
            <p className="text-muted-foreground">
              Discover local businesses and professional services in your area
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user && (
              <Button asChild>
                <Link href="/create/service">
                  <Plus className="h-4 w-4 mr-2" />
                  List Service
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
            type="service"
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
                  onClick={loadServices}
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
              'Home Services',
              'Food & Beverage',
              'Technology',
              'Professional Services',
              'Health & Wellness',
              'Transportation',
              'Education',
              'Entertainment'
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
              {loading ? 'Loading...' : `${services.length} Services Available`}
            </h2>
            <Badge variant="outline">
              <Building className="h-3 w-3 mr-1" />
              {services.filter(s => s.service_providers?.is_verified).length} Verified
            </Badge>
          </div>
          
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Sort by: Rating</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
            <option>Sort by: Distance</option>
            <option>Sort by: Latest</option>
          </select>
        </div>

        {/* Services Grid/List */}
        {loading ? (
          <SkeletonGrid count={6} columns={3} />
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onContact={handleContactProvider}
                onView={handleViewService}
                rating={getRandomRating()}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && services.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Services
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && services.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
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
