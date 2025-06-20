'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, DollarSign, Clock, Star, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createSkill } from '@/lib/database'
import type { Skill, SkillProficiency } from '@/types/database'

interface SkillFormData {
  skillName: string
  skillCategory: string
  skillSubCategory: string
  proficiency: SkillProficiency | ''
  timeCostPerHour: string
  pricing: string
  description: string
}

const skillCategories = [
  {
    name: 'Web Development',
    subcategories: ['Frontend', 'Backend', 'Full Stack', 'WordPress', 'E-commerce']
  },
  {
    name: 'Mobile Development',
    subcategories: ['iOS', 'Android', 'React Native', 'Flutter', 'Hybrid Apps']
  },
  {
    name: 'Design',
    subcategories: ['UI/UX Design', 'Graphic Design', 'Logo Design', 'Branding', 'Print Design']
  },
  {
    name: 'Digital Marketing',
    subcategories: ['SEO', 'Social Media', 'Content Marketing', 'PPC', 'Email Marketing']
  },
  {
    name: 'Writing & Content',
    subcategories: ['Content Writing', 'Copywriting', 'Technical Writing', 'Blog Writing', 'Translation']
  },
  {
    name: 'Data & Analytics',
    subcategories: ['Data Analysis', 'Data Science', 'Machine Learning', 'Business Intelligence', 'Statistics']
  },
  {
    name: 'Business',
    subcategories: ['Consulting', 'Project Management', 'Business Analysis', 'Strategy', 'Operations']
  },
  {
    name: 'Creative',
    subcategories: ['Photography', 'Video Editing', 'Animation', 'Music Production', 'Voice Over']
  }
]

const proficiencyLevels: { value: SkillProficiency; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Learning the basics, 0-1 years experience' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with fundamentals, 1-3 years experience' },
  { value: 'advanced', label: 'Advanced', description: 'Highly skilled, 3-5 years experience' },
  { value: 'expert', label: 'Expert', description: 'Industry expert, 5+ years experience' }
]

export function SkillCreationForm() {
  const [formData, setFormData] = useState<SkillFormData>({
    skillName: '',
    skillCategory: '',
    skillSubCategory: '',
    proficiency: '',
    timeCostPerHour: '8',
    pricing: '',
    description: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const selectedCategory = skillCategories.find(cat => cat.name === formData.skillCategory)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'skillCategory' && { skillSubCategory: '' })
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.skillName.trim()) {
      setError('Skill name is required')
      return false
    }
    if (!formData.skillCategory) {
      setError('Skill category is required')
      return false
    }
    if (!formData.proficiency) {
      setError('Proficiency level is required')
      return false
    }
    if (!formData.timeCostPerHour || parseFloat(formData.timeCostPerHour) <= 0) {
      setError('Valid time cost per hour is required')
      return false
    }
    if (!formData.pricing || parseFloat(formData.pricing) <= 0) {
      setError('Valid pricing is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user || !userProfile) {
      setError('You must be logged in to create a skill')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const skillData: Omit<Skill, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        skill_name: formData.skillName.trim(),
        skill_category: formData.skillCategory,
        skill_sub_category: formData.skillSubCategory || undefined,
        proficiency: formData.proficiency as SkillProficiency,
        time_cost_per_hour: parseFloat(formData.timeCostPerHour),
        pricing: parseFloat(formData.pricing),
        is_active: true
      }

      const { data, error } = await createSkill(skillData)

      if (error) {
        setError(error)
      } else if (data) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/skills')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Skill creation error:', err)
      setError(err?.message || 'Failed to create skill. Please try again.')
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
          <h3 className="text-lg font-semibold mb-2">Skill Added Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your skill has been added to your profile. You can now receive requests from clients looking for your expertise.
          </p>
          <div className="animate-pulse text-sm text-muted-foreground">
            Redirecting to your skills dashboard...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Skill Information</CardTitle>
        <CardDescription>
          Add a new skill to your profile and start earning from your expertise
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Name */}
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="skillName"
                name="skillName"
                placeholder="e.g., React Development, Logo Design, SEO Optimization"
                value={formData.skillName}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.skillCategory}
                onValueChange={(value) => handleSelectChange('skillCategory', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map(category => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={formData.skillSubCategory}
                onValueChange={(value) => handleSelectChange('skillSubCategory', value)}
                disabled={loading || !selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subcategories.map(subcategory => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proficiency Level */}
          <div className="space-y-2">
            <Label>Proficiency Level *</Label>
            <Select
              value={formData.proficiency}
              onValueChange={(value) => handleSelectChange('proficiency', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your proficiency level" />
              </SelectTrigger>
              <SelectContent>
                {proficiencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: proficiencyLevels.indexOf(level) + 1 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                        ))}
                        {Array.from({ length: 4 - proficiencyLevels.indexOf(level) }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-gray-300" />
                        ))}
                      </div>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeCostPerHour">Time Cost (Hours) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="timeCostPerHour"
                  name="timeCostPerHour"
                  type="number"
                  placeholder="8"
                  value={formData.timeCostPerHour}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  min="0.5"
                  step="0.5"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Typical hours needed for this type of work
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing">Rate (PHP) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400 z-10 pointer-events-none" />
                <Input
                  id="pricing"
                  name="pricing"
                  type="number"
                  placeholder="2500"
                  value={formData.pricing}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your rate for this skill
              </p>
            </div>
          </div>

          {/* Pricing Preview */}
          {formData.pricing && formData.timeCostPerHour && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Pricing Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <div className="font-medium">
                    ₱{(parseFloat(formData.pricing) / parseFloat(formData.timeCostPerHour)).toFixed(2)}/hour
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total for {formData.timeCostPerHour}h:</span>
                  <div className="font-medium">₱{parseFloat(formData.pricing).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

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
                  Adding Skill...
                </>
              ) : (
                'Add Skill'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
