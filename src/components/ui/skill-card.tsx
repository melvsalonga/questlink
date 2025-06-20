import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Separator } from './separator'
import { Star, Clock, DollarSign, Award, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Skill } from '@/types/database'

interface SkillCardProps {
  skill: Skill & {
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
  onHire?: (skillId: string) => void
  onView?: (skillId: string) => void
  showActions?: boolean
  rating?: number
}

export function SkillCard({ 
  skill, 
  className, 
  onHire, 
  onView, 
  showActions = true,
  rating = 0
}: SkillCardProps) {
  const profile = skill.users?.profiles?.[0]
  const specialistName = skill.users ? `${skill.users.first_name} ${skill.users.last_name}` : 'Unknown'
  const specialistInitials = skill.users ? `${skill.users.first_name[0]}${skill.users.last_name[0]}` : 'U'

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'beginner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-green-600 transition-colors">
              {skill.skill_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {skill.skill_category}
              {skill.skill_sub_category && ` • ${skill.skill_sub_category}`}
            </CardDescription>
          </div>
          <Badge 
            variant="skill" 
            className="ml-2 animate-glow"
          >
            {skill.is_active ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Skill Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <Badge 
              variant="outline" 
              className={cn("text-xs", getProficiencyColor(skill.proficiency))}
            >
              {skill.proficiency}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {skill.time_cost_per_hour} min/hour
            </span>
          </div>
        </div>

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

        {/* Specialist Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.profile_picture} />
              <AvatarFallback className="text-xs">{specialistInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{specialistName}</p>
              {profile?.location && (
                <p className="text-xs text-muted-foreground">{profile.location}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-lg font-bold text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>₱{skill.pricing.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(skill.id)}
          >
            View Profile
          </Button>
          <Button 
            variant="skill" 
            size="sm" 
            className="flex-1"
            onClick={() => onHire?.(skill.id)}
            disabled={!skill.is_active}
          >
            Hire Now
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
