import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Separator } from './separator'
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Quest } from '@/types/database'

interface QuestCardProps {
  quest: Quest & {
    users?: {
      first_name: string
      last_name: string
      profiles?: {
        profile_picture?: string
        location?: string
      }[]
    }
  }
  className?: string
  onApply?: (questId: string) => void
  onView?: (questId: string) => void
  showActions?: boolean
}

export function QuestCard({ 
  quest, 
  className, 
  onApply, 
  onView, 
  showActions = true 
}: QuestCardProps) {
  const profile = quest.users?.profiles?.[0]
  const ownerName = quest.users ? `${quest.users.first_name} ${quest.users.last_name}` : 'Unknown'
  const ownerInitials = quest.users ? `${quest.users.first_name[0]}${quest.users.last_name[0]}` : 'U'

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
              {quest.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {quest.description}
            </CardDescription>
          </div>
          <Badge variant="quest" className="ml-2 animate-glow">
            {quest.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quest Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(quest.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{quest.start_time} - {quest.end_time}</span>
          </div>
          {quest.location && (
            <div className="flex items-center space-x-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{quest.location}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {quest.tags && quest.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quest.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="category" className="text-xs">
                {tag}
              </Badge>
            ))}
            {quest.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{quest.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Owner Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.profile_picture} />
              <AvatarFallback className="text-xs">{ownerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{ownerName}</p>
              {profile?.location && (
                <p className="text-xs text-muted-foreground">{profile.location}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
            <DollarSign className="h-4 w-4" />
            <span>₱{quest.pricing.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(quest.id)}
          >
            View Details
          </Button>
          <Button 
            variant="quest" 
            size="sm" 
            className="flex-1"
            onClick={() => onApply?.(quest.id)}
          >
            Apply Now
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
