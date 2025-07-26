'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock, MapPin, DollarSign, Tag, X, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createQuest } from '@/lib/database'
import type { Quest } from '@/types/database'

interface QuestFormData {
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pricing: string
  location: string
  requirements: string
  tags: string[]
  newTag: string
}

export function QuestCreationForm() {
  const [formData, setFormData] = useState<QuestFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    pricing: '',
    location: '',
    requirements: '',
    tags: [],
    newTag: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  // Predefined tag suggestions
  const suggestedTags = [
    'Web Development', 'Mobile App', 'Design', 'Marketing', 'Writing',
    'Data Analysis', 'Photography', 'Video Editing', 'Consulting',
    'Translation', 'Tutoring', 'Research', 'Social Media', 'SEO',
    'E-commerce', 'Database', 'API Development', 'UI/UX', 'Branding'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
        newTag: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddNewTag = () => {
    if (formData.newTag.trim()) {
      addTag(formData.newTag)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTag()
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Quest title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Quest description is required')
      return false
    }
    if (!formData.startDate) {
      setError('Start date is required')
      return false
    }
    if (!formData.endDate) {
      setError('End date is required')
      return false
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date')
      return false
    }
    if (!formData.pricing || parseFloat(formData.pricing) <= 0) {
      setError('Valid pricing is required')
      return false
    }
    if (formData.tags.length === 0) {
      setError('At least one tag is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user || !userProfile) {
      setError('You must be logged in to create a quest')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const questData: Omit<Quest, 'id' | 'created_at' | 'updated_at'> = {
        quest_owner_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_date: formData.startDate,
        end_date: formData.endDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        pricing: parseFloat(formData.pricing),
        tags: formData.tags,
        status: 'open',
        location: formData.location.trim() || undefined,
        requirements: formData.requirements.trim() || undefined
      }

      const { data, error } = await createQuest(questData)

      if (error) {
        setError(error)
      } else if (data) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/quests/${data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Quest creation error:', err)
      setError(err?.message || 'Failed to create quest. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Quest Created Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your quest has been posted and is now visible to specialists. You'll be redirected to view your quest shortly.
          </p>
          <div className="animate-pulse text-sm text-muted-foreground">
            Redirecting...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Quest Details</CardTitle>
        <CardDescription>
          Provide clear information about your project to attract the right specialists
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Build a responsive e-commerce website"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
              maxLength={200}
            />
              <p className="text-sm text-muted-foreground">
                We'll never share your personal information with anyone else.
              </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project in detail. Include what you need, your expectations, and any specific requirements..."
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricing">Budget (PHP) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="pricing"
                  name="pricing"
                  type="number"
                  placeholder="5000"
                  value={formData.pricing}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Makati City, Metro Manila"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="Specific skills, experience, or qualifications needed..."
              value={formData.requirements}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div>
              <Label>Tags * (Select or add custom tags)</Label>
              <p
