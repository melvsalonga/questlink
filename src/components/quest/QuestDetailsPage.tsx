'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Star,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getQuestById, applyToQuest } from '@/lib/database'
import type { Quest } from '@/types/database'
import { Header } from '@/components/layout/Header'

interface QuestDetailsPageProps {
  questId: string
}

export function QuestDetailsPage({ questId }: QuestDetailsPageProps) {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationNote, setApplicationNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadQuest()
  }, [questId])

  const loadQuest = async () => {
    try {
      const { data, error } = await getQuestById(questId)
      
      if (error) {
        setError(error)
      } else if (data) {
        setQuest(data)
      } else {
        setError('Quest not found')
      }
    } catch (err: any) {
      console.error('Error loading quest:', err)
      setError('Failed to load quest details')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user || !quest) {
      setError('You must be logged in to apply for quests')
      return
    }

    if (quest.quest_owner_id === user.id) {
      setError('You cannot apply to your own quest')
      return
    }

    setApplying(true)
    setError('')

    try {
      const { data, error } = await applyToQuest(quest.id, user.id, applicationNote)
      
      if (error) {
        if (error.includes('duplicate key')) {
          setError('You have already applied to this quest')
        } else {
          setError(error)
        }
      } else {
        setSuccess(true)
        setApplicationNote('')
      }
    } catch (err: any) {
      console.error('Application error:', err)
      setError('Failed to submit application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !quest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Quest Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/quests')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quests
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!quest) return null

  const questOwner = (quest as any).users || null
  const ownerProfile = questOwner?.profiles?.[0] || null
  const isOwner = user?.id === quest.quest_owner_id

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Quest Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quest Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{quest.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(quest.start_date).toLocaleDateString()} - {new Date(quest.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quest.start_time} - {quest.end_time}
                      </div>
                      {quest.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {quest.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₱{quest.pricing.toLocaleString()}
                    </div>
                    <Badge variant={quest.status === 'open' ? 'default' : 'secondary'}>
                      {quest.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{quest.description}</p>
                  </div>
                  
                  {quest.requirements && (
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{quest.requirements}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {quest.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Section */}
            {!isOwner && quest.status === 'open' && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Quest</CardTitle>
                  <CardDescription>
                    Tell the quest owner why you're the right person for this job
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
                      <p className="text-muted-foreground">
                        Your application has been sent to the quest owner. They will review it and get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="applicationNote">Application Message (Optional)</Label>
                        <Textarea
                          id="applicationNote"
                          placeholder="Introduce yourself and explain why you're perfect for this quest..."
                          value={applicationNote}
                          onChange={(e) => setApplicationNote(e.target.value)}
                          rows={4}
                          disabled={applying}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleApply}
                        disabled={applying || !user}
                        className="w-full"
                      >
                        {applying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Apply for Quest
                          </>
                        )}
                      </Button>
                      
                      {!user && (
                        <p className="text-sm text-muted-foreground text-center">
                          You must be logged in to apply for quests.{' '}
                          <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth/login')}>
                            Sign in here
                          </Button>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">This is your quest. You can manage applications from your dashboard.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quest Owner */}
            <Card>
              <CardHeader>
                <CardTitle>Quest Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ownerProfile?.profile_picture} />
                    <AvatarFallback>
                      {questOwner?.first_name?.[0]}{questOwner?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {questOwner?.first_name} {questOwner?.last_name}
                    </h4>
              <p className="text-sm text-muted-foreground">
                Don't see what you're looking for? Post your own quest!
              </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs text-muted-foreground">4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
                
                {ownerProfile?.description && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">
                      {ownerProfile.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quest Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm font-medium">
                    {new Date(quest.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="text-sm font-medium">₱{quest.pricing.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date(quest.end_date).getTime() - new Date(quest.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={quest.status === 'open' ? 'default' : 'secondary'}>
                    {quest.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Similar Quests */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <h5 className="font-medium text-sm mb-1">Sample Quest {i}</h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        Similar project description...
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">₱{(5000 + i * 1000).toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">Open</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
