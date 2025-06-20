'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, DollarSign, Clock, Tag, X, Plus, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createService } from '@/lib/database'
import type { Service } from '@/types/database'

interface ServiceFormData {
  title: string
  description: string
  pricing: string
  categoryTags: string[]
  newTag: string
  availableDays: string[]
  availableTime: string
}

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

const suggestedServiceTags = [
  'Digital Marketing', 'Web Design', 'SEO Services', 'Social Media Management',
  'Content Creation', 'Graphic Design', 'Photography', 'Video Production',
  'Consulting', 'Business Strategy', 'Project Management', 'Data Analysis',
  'Software Development', 'Mobile Apps', 'E-commerce', 'Branding',
  'Copywriting', 'Translation', 'Virtual Assistant', 'Customer Support'
]

export function ServiceCreationForm() {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    pricing: '',
    categoryTags: [],
    newTag: '',
    availableDays: [],
    availableTime: '9:00 AM - 5:00 PM'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.categoryTags.includes(trimmedTag) && formData.categoryTags.length < 10) {
      setFormData(prev => ({
        ...prev,
        categoryTags: [...prev.categoryTags, trimmedTag],
        newTag: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categoryTags: prev.categoryTags.filter(tag => tag !== tagToRemove)
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

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Service title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Service description is required')
      return false
    }
    if (!formData.pricing || parseFloat(formData.pricing) <= 0) {
      setError('Valid pricing is required')
      return false
    }
    if (formData.categoryTags.length === 0) {
      setError('At least one category tag is required')
      return false
    }
    if (formData.availableDays.length === 0) {
      setError('At least one available day is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user || !userProfile) {
      setError('You must be logged in to create a service')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
        service_provider_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        pricing: parseFloat(formData.pricing),
        category_tags: formData.categoryTags,
        available_days: formData.availableDays,
        available_time: formData.availableTime,
        is_active: true
      }

      const { data, error } = await createService(serviceData)

      if (error) {
        setError(error)
      } else if (data) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/services')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Service creation error:', err)
      setError(err?.message || 'Failed to create service. Please try again.')
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
          <h3 className="text-lg font-semibold mb-2">Service Created Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your service has been added to your business profile. Clients can now discover and book your services.
          </p>
          <div className="animate-pulse text-sm text-muted-foreground">
            Redirecting to your services dashboard...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Service Information</CardTitle>
        <CardDescription>
          Create a new service offering for your business profile
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Professional Website Design, SEO Optimization, Social Media Management"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Service Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Service Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your service in detail. What do you offer? What makes your service unique? What can clients expect?"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <Label htmlFor="pricing">Service Price (PHP) *</Label>
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
            <p className="text-sm text-muted-foreground">
              Set your base price for this service
            </p>
          </div>

          {/* Category Tags */}
          <div className="space-y-4">
            <div>
              <Label>Service Categories * (Select or add custom tags)</Label>
              <p className="text-sm text-muted-foreground">
                Help clients find your service by adding relevant category tags
              </p>
            </div>

            {/* Suggested Tags */}
            <div>
              <p className="text-sm font-medium mb-2">Suggested Categories:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedServiceTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.categoryTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => formData.categoryTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                  >
                    {tag}
                    {formData.categoryTags.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="newTag"
                  placeholder="Add custom category..."
                  value={formData.newTag}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading || formData.categoryTags.length >= 10}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddNewTag}
                disabled={!formData.newTag.trim() || formData.categoryTags.length >= 10 || loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {formData.categoryTags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Categories ({formData.categoryTags.length}/10):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.categoryTags.map(tag => (
                    <Badge key={tag} variant="default" className="pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Available Days */}
          <div className="space-y-4">
            <div>
              <Label>Available Days *</Label>
              <p className="text-sm text-muted-foreground">
                Select the days when you're available to provide this service
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={formData.availableDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                    disabled={loading}
                  />
                  <Label htmlFor={day.value} className="text-sm font-normal cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Available Time */}
          <div className="space-y-2">
            <Label htmlFor="availableTime">Available Hours</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="availableTime"
                name="availableTime"
                placeholder="e.g., 9:00 AM - 5:00 PM, Flexible hours, By appointment"
                value={formData.availableTime}
                onChange={handleInputChange}
                disabled={loading}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Specify your typical working hours or availability
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              variant="quest"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Service...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
