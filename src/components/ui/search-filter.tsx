import React, { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Separator } from './separator'
import { Search, Filter, X, MapPin, DollarSign } from 'lucide-react'
import { cn } from '@/utils/cn'
import { SKILL_CATEGORIES, SERVICE_CATEGORIES } from '@/utils/constants'

interface SearchFilterProps {
  type: 'quest' | 'skill' | 'service'
  onSearch?: (query: string) => void
  onFilter?: (filters: SearchFilters) => void
  className?: string
}

interface SearchFilters {
  category?: string
  location?: string
  priceRange?: {
    min: number
    max: number
  }
  tags?: string[]
}

export function SearchFilter({ type, onSearch, onFilter, className }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  const categories = type === 'service' ? SERVICE_CATEGORIES : SKILL_CATEGORIES

  const handleSearch = () => {
    onSearch?.(searchQuery)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter?.({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="default">
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((category) => (
                  <Badge
                    key={category}
                    variant={filters.category === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => 
                      handleFilterChange(
                        'category', 
                        filters.category === category ? undefined : category
                      )
                    }
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter location..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range (₱)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ''}
                    onChange={(e) => 
                      handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ''}
                    onChange={(e) => 
                      handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under ₱500', max: 500 },
                { label: '₱500 - ₱1,000', min: 500, max: 1000 },
                { label: '₱1,000 - ₱5,000', min: 1000, max: 5000 },
                { label: 'Over ₱5,000', min: 5000 }
              ].map((range) => (
                <Badge
                  key={range.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => 
                    handleFilterChange('priceRange', {
                      min: range.min,
                      max: range.max
                    })
                  }
                >
                  {range.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.category}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('category', undefined)}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.location}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('location', undefined)}
              />
            </Badge>
          )}
          {filters.priceRange && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>
                ₱{filters.priceRange.min || 0} - ₱{filters.priceRange.max || '∞'}
              </span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('priceRange', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
