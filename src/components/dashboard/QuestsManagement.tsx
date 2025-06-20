'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  MapPin,
  Clock,
  Users,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getQuestsByOwnerId, updateQuest, deleteQuest } from '@/lib/database'
import type { Quest } from '@/types/database'

export function QuestsManagement() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingQuest, setUpdatingQuest] = useState<string | null>(null)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadQuests()
  }, [user, router])

  const loadQuests = async () => {
    if (!user) return

    try {
      const { data, error } = await getQuestsByOwnerId(user.id)

      if (error) {
        setError(error)
      } else {
        setQuests(data || [])
      }
    } catch (err: any) {
      console.error('Error loading quests:', err)
      setError('Failed to load quests')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (questId: string, newStatus: string) => {
    setUpdatingQuest(questId)
    
    try {
      const { error } = await updateQuest(questId, { status: newStatus as any })
      
      if (error) {
        setError(error)
      } else {
        setQuests(prev => prev.map(quest => 
          quest.id === questId 
            ? { ...quest, status: newStatus as any }
            : quest
        ))
      }
    } catch (err: any) {
      console.error('Error updating quest:', err)
      setError('Failed to update quest status')
    } finally {
      setUpdatingQuest(null)
    }
  }

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
      return
    }

    setUpdatingQuest(questId)
    
    try {
      const { error } = await deleteQuest(questId)
      
      if (error) {
        setError(error)
      } else {
        setQuests(prev => prev.filter(quest => quest.id !== questId))
      }
    } catch (err: any) {
      console.error('Error deleting quest:', err)
      setError('Failed to delete quest')
    } finally {
      setUpdatingQuest(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'completed': return 'bg-purple-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filterQuestsByStatus = (status: string) => {
    return quests.filter(quest => quest.status === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{quest.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(quest.status)} text-white border-0`}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(quest.status)}
                  <span className="capitalize">{quest.status.replace('_', ' ')}</span>
                </div>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ₱{quest.pricing.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {quest.description}
        </p>

        {/* Quest Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(quest.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{quest.start_time} - {quest.end_time}</span>
          </div>
          {quest.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{quest.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>3 applications</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {quest.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {quest.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{quest.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quests/${quest.id}`)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quests/${quest.id}/edit`)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteQuest(quest.id)}
            disabled={updatingQuest === quest.id}
            className="text-destructive hover:text-destructive"
          >
            {updatingQuest === quest.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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
              <h1 className="text-3xl font-bold">My Quests</h1>
              <p className="text-muted-foreground">
                Manage your posted quests and track applications
              </p>
            </div>
          </div>
          
          <Button onClick={() => router.push('/create/quest')}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Quest
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quest Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({quests.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({filterQuestsByStatus('open').length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({filterQuestsByStatus('in_progress').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterQuestsByStatus('completed').length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filterQuestsByStatus('cancelled').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {quests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Quests Posted Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by posting your first quest to find talented specialists for your projects.
                  </p>
                  <Button onClick={() => router.push('/create/quest')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Quest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {quests.map(quest => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            )}
          </TabsContent>

          {['open', 'in_progress', 'completed', 'cancelled'].map(status => (
            <TabsContent key={status} value={status} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {filterQuestsByStatus(status).map(quest => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
              {filterQuestsByStatus(status).length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">
                      No {status.replace('_', ' ')} quests found.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Stats Summary */}
        {quests.length > 0 && (
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{quests.length}</div>
                <p className="text-xs text-muted-foreground">Total Quests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filterQuestsByStatus('open').length}</div>
                <p className="text-xs text-muted-foreground">Open Quests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ₱{quests.reduce((sum, q) => sum + q.pricing, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
