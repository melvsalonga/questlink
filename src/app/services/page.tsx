'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { ServiceCard } from '@/components/ui/service-card'
import { SearchFilter } from '@/components/ui/search-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/loading'
import { Plus, Filter, Grid, List, Building, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ServicesPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Sample service data for now
  const sampleServices = [
    {
      id: '1',
      title: 'Computer Repair & Maintenance',
      description: 'Professional computer diagnosis and repair services for homes and businesses. We fix laptops, desktops, and provide maintenance services.',
      pricing: 500,
      category_tags: ['Technology', 'Professional Services', 'Computer Repair'],
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      available_time: '9:00 AM - 6:00 PM',
      is_active: true,
      service_provider_id: '1',
      created_at: '2025-06-20',
      updated_at: '2025-06-20',
      service_providers: {
        id: '1',
        title: 'TechFix Solutions',
        description: 'Professional computer repair services',
        location: 'Makati City',
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        available_time: '9:00 AM - 6:00 PM',
        is_verified: true,
        is_active: true,
        user_id: '1',
        created_at: '2025-06-20',
        updated_at: '2025-06-20',
        users: {
          first_name: 'Mike',
          last_name: 'Wilson',
          profiles: [{
            profile_picture: ''
          }]
        }
      }
    },
    {
      id: '2',
      title: 'Home Cleaning Services',
      description: 'Professional residential cleaning services. Deep cleaning, regular maintenance, and post-construction cleanup available.',
      pricing: 800,
      category_tags: ['Home Services', 'Cleaning', 'Residential'],
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      available_time: '8:00 AM - 5:00 PM',
      is_active: true,
      service_provider_id: '2',
      created_at: '2025-06-19',
      updated_at: '2025-06-19',
      service_providers: {
        id: '2',
        title: 'CleanPro Services',
        description: 'Professional cleaning services',
        location: 'Quezon City',
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        available_time: '8:00 AM - 5:00 PM',
        is_verified: true,
        is_active: true,
        user_id: '2',
        created_at: '2025-06-19',
        updated_at: '2025-06-19',
        users: {
          first_name: 'Lisa',
          last_name: 'Rodriguez',
          profiles: [{
            profile_picture: ''
          }]
        }
      }
    },
    {
      id: '3',
      title: 'Food Delivery Service',
      description: 'Fast and reliable food delivery from your favorite local restaurants. Hot meals delivered fresh to your doorstep.',
      pricing: 50,
      category_tags: ['Food & Beverage', 'Delivery', 'Restaurant'],
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      available_time: '10:00 AM - 10:00 PM',
      is_active: true,
      service_provider_id: '3',
      created_at: '2025-06-18',
      updated_at: '2025-06-18',
      service_providers: {
        id: '3',
        title: 'QuickBite Delivery',
        description: 'Fast food delivery service',
        location: 'Manila',
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        available_time: '10:00 AM - 10:00 PM',
        is_verified: false,
        is_active: true,
        user_id: '3',
        created_at: '2025-06-18',
        updated_at: '2025-06-18',
        users: {
          first_name: 'Carlos',
          last_name: 'Mendoza',
          profiles: [{
            profile_picture: ''
          }]
        }
      }
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setServices(sampleServices)
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

  const handleContact = (serviceId: string) => {
    console.log('Contact service:', serviceId)
    // Implement contact logic
  }

  const handleView = (serviceId: string) => {
    console.log('View service:', serviceId)
    // Navigate to service details
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
                onContact={handleContact}
                onView={handleView}
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
