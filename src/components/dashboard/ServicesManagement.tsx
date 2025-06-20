'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  DollarSign, 
  Calendar,
  Clock,
  Loader2,
  ArrowLeft,
  Briefcase
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getServicesByProviderId, updateService, deleteService } from '@/lib/database'
import type { Service } from '@/types/database'

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingService, setUpdatingService] = useState<string | null>(null)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadServices()
  }, [user, router])

  const loadServices = async () => {
    if (!user) return

    try {
      const { data, error } = await getServicesByProviderId(user.id)

      if (error) {
        setError(error)
      } else {
        setServices(data || [])
      }
    } catch (err: any) {
      console.error('Error loading services:', err)
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    setUpdatingService(serviceId)
    
    try {
      const { error } = await updateService(serviceId, { is_active: !currentStatus })
      
      if (error) {
        setError(error)
      } else {
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, is_active: !currentStatus }
            : service
        ))
      }
    } catch (err: any) {
      console.error('Error updating service:', err)
      setError('Failed to update service status')
    } finally {
      setUpdatingService(null)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    setUpdatingService(serviceId)
    
    try {
      const { error } = await deleteService(serviceId)
      
      if (error) {
        setError(error)
      } else {
        setServices(prev => prev.filter(service => service.id !== serviceId))
      }
    } catch (err: any) {
      console.error('Error deleting service:', err)
      setError('Failed to delete service')
    } finally {
      setUpdatingService(null)
    }
  }

  const formatAvailableDays = (days: string[]) => {
    const dayNames = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    }
    
    return days.map(day => dayNames[day as keyof typeof dayNames]).join(', ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Services</h1>
              <p className="text-muted-foreground">
                Manage your business services and offerings
              </p>
            </div>
          </div>
          
          <Button onClick={() => router.push('/create/service')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Services Added Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your business profile by adding your first service. Showcase what you offer to attract clients.
              </p>
              <Button onClick={() => router.push('/create/service')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card key={service.id} className={`relative ${!service.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {service.category_tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {service.category_tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.category_tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {service.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {service.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Price</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      ₱{service.pricing.toLocaleString()}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Available Days</span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatAvailableDays(service.available_days)}
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Hours</span>
                    </div>
                    <div className="text-sm font-medium">
                      {service.available_time}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant={service.is_active ? "default" : "secondary"}
                      className="w-full justify-center"
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      disabled={updatingService === service.id}
                      className="flex-1"
                    >
                      {updatingService === service.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : service.is_active ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/services/${service.id}/edit`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      disabled={updatingService === service.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {services.length > 0 && (
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{services.length}</div>
                <p className="text-xs text-muted-foreground">Total Services</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{services.filter(s => s.is_active).length}</div>
                <p className="text-xs text-muted-foreground">Active Services</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ₱{Math.round(services.reduce((sum, s) => sum + s.pricing, 0) / services.length).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Avg. Service Price</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ₱{services.reduce((sum, s) => sum + s.pricing, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
