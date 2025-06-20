import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Separator } from './separator'
import { Star, MapPin, DollarSign, Clock, Building } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Service, ServiceProvider } from '@/types/database'

interface ServiceCardProps {
  service: Service & {
    service_providers?: ServiceProvider & {
      users?: {
        first_name: string
        last_name: string
        profiles?: {
          profile_picture?: string
        }[]
      }
    }
  }
  className?: string
  onContact?: (serviceId: string) => void
  onView?: (serviceId: string) => void
  showActions?: boolean
  rating?: number
}

export function ServiceCard({ 
  service, 
  className, 
  onContact, 
  onView, 
  showActions = true,
  rating = 0
}: ServiceCardProps) {
  const provider = service.service_providers
  const profile = provider?.users?.profiles?.[0]
  const providerName = provider?.users ? `${provider.users.first_name} ${provider.users.last_name}` : provider?.title || 'Unknown'
  const providerInitials = provider?.users ? `${provider.users.first_name[0]}${provider.users.last_name[0]}` : 'U'

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-orange-500",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-orange-600 transition-colors">
              {service.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {service.description}
            </CardDescription>
          </div>
          <Badge 
            variant="service" 
            className="ml-2 animate-glow"
          >
            {service.is_active ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Service Details */}
        <div className="space-y-2">
          {provider?.location && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{provider.location}</span>
            </div>
          )}
          
          {service.available_time && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.available_time}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {service.category_tags && service.category_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.category_tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="category" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.category_tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{service.category_tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(rating) 
                      ? "text-yellow-400 fill-current" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({rating.toFixed(1)})
            </span>
          </div>
        )}

        <Separator />

        {/* Provider Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.profile_picture} />
              <AvatarFallback className="text-xs">{providerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{providerName}</p>
              {provider?.is_verified && (
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">Verified Business</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-lg font-bold text-orange-600">
              <DollarSign className="h-4 w-4" />
              <span>₱{service.pricing.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">starting price</p>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(service.id)}
          >
            View Details
          </Button>
          <Button 
            variant="service" 
            size="sm" 
            className="flex-1"
            onClick={() => onContact?.(service.id)}
            disabled={!service.is_active}
          >
            Contact Now
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
