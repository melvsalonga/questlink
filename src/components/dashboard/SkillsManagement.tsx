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
  Star, 
  DollarSign, 
  Clock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getSkillsByUserId, updateSkill, deleteSkill } from '@/lib/database'
import type { Skill } from '@/types/database'

export function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadSkills()
  }, [user, router])

  const loadSkills = async () => {
    if (!user) return

    try {
      const { data, error } = await getSkillsByUserId(user.id)

      if (error) {
        setError(error)
      } else {
        setSkills(data || [])
      }
    } catch (err: any) {
      console.error('Error loading skills:', err)
      setError('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const toggleSkillStatus = async (skillId: string, currentStatus: boolean) => {
    setUpdatingSkill(skillId)
    
    try {
      const { error } = await updateSkill(skillId, { is_active: !currentStatus })
      
      if (error) {
        setError(error)
      } else {
        setSkills(prev => prev.map(skill => 
          skill.id === skillId 
            ? { ...skill, is_active: !currentStatus }
            : skill
        ))
      }
    } catch (err: any) {
      console.error('Error updating skill:', err)
      setError('Failed to update skill status')
    } finally {
      setUpdatingSkill(null)
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return
    }

    setUpdatingSkill(skillId)
    
    try {
      const { error } = await deleteSkill(skillId)
      
      if (error) {
        setError(error)
      } else {
        setSkills(prev => prev.filter(skill => skill.id !== skillId))
      }
    } catch (err: any) {
      console.error('Error deleting skill:', err)
      setError('Failed to delete skill')
    } finally {
      setUpdatingSkill(null)
    }
  }

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert': return 'bg-purple-500'
      case 'advanced': return 'bg-blue-500'
      case 'intermediate': return 'bg-green-500'
      case 'beginner': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getProficiencyStars = (proficiency: string) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
    return levels[proficiency as keyof typeof levels] || 1
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
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
              <h1 className="text-3xl font-bold">My Skills</h1>
              <p className="text-muted-foreground">
                Manage your skills and expertise
              </p>
            </div>
          </div>
          
          <Button onClick={() => router.push('/create/skill')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Skill
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Skills Grid */}
        {skills.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Skills Added Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your profile by adding your first skill. Showcase your expertise and attract clients.
              </p>
              <Button onClick={() => router.push('/create/skill')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map(skill => (
              <Card key={skill.id} className={`relative ${!skill.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{skill.skill_name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{skill.skill_category}</Badge>
                        {skill.skill_sub_category && (
                          <Badge variant="secondary" className="text-xs">
                            {skill.skill_sub_category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {skill.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Proficiency */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Proficiency</span>
                      <Badge 
                        variant="outline" 
                        className={`${getProficiencyColor(skill.proficiency)} text-white border-0 capitalize`}
                      >
                        {skill.proficiency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < getProficiencyStars(skill.proficiency) 
                              ? 'fill-current text-yellow-500' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Rate</span>
                      </div>
                      <div className="font-medium">₱{skill.pricing.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span>Time</span>
                      </div>
                      <div className="font-medium">{skill.time_cost_per_hour}h</div>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Hourly Rate</div>
                    <div className="font-semibold">
                      ₱{(skill.pricing / skill.time_cost_per_hour).toFixed(2)}/hour
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSkillStatus(skill.id, skill.is_active)}
                      disabled={updatingSkill === skill.id}
                      className="flex-1"
                    >
                      {updatingSkill === skill.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : skill.is_active ? (
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
                      onClick={() => router.push(`/skills/${skill.id}/edit`)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSkill(skill.id)}
                      disabled={updatingSkill === skill.id}
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
        {skills.length > 0 && (
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{skills.length}</div>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{skills.filter(s => s.is_active).length}</div>
                <p className="text-xs text-muted-foreground">Active Skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ₱{Math.round(skills.reduce((sum, s) => sum + (s.pricing / s.time_cost_per_hour), 0) / skills.length).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Avg. Hourly Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{skills.filter(s => s.proficiency === 'expert').length}</div>
                <p className="text-xs text-muted-foreground">Expert Level</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
