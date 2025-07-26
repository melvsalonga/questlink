'use client'

import React from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sword, 
  User, 
  Building, 
  ArrowRight,
  Star,
  DollarSign,
  Clock,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const createOptions = [
    {
      id: 'quest',
      title: 'Post a Quest',
      description: 'Need help with a project? Post a quest and find the right specialist for the job.',
      icon: Sword,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Set your budget and timeline',
        'Describe your project requirements',
        'Review applications from specialists',
        'Choose the best candidate'
      ],
      href: '/create/quest',
      badge: 'Most Popular',
      stats: '1,000+ quests posted this month'
    },
    {
      id: 'skill',
      title: 'Add Your Skill',
      description: 'Showcase your expertise and get hired by clients looking for your specific skills.',
      icon: User,
      color: 'from-green-500 to-teal-600',
      features: [
        'Highlight your expertise level',
        'Set your hourly rates',
        'Build your professional profile',
        'Get discovered by clients'
      ],
      href: '/create/skill',
      badge: 'High Demand',
      stats: '500+ specialists joined this month'
    },
    {
      id: 'service',
      title: 'List Your Service',
      description: 'Offer professional services to customers in your area and grow your business.',
      icon: Building,
      color: 'from-orange-500 to-red-600',
      features: [
        'Promote your business',
        'Set service availability',
        'Manage customer inquiries',
        'Build customer relationships'
      ],
      href: '/create/service',
      badge: 'Business Growth',
      stats: '200+ services listed this month'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What would you like to create?
          </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose how you want to participate in the QuestLink community. 
              Whether you need help or want to offer your services, we've got you covered.
            </p>
        </div>

        {/* Create Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {createOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Card 
                key={option.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="animate-pulse">
                      {option.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  {/* Features */}
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{option.stats}</span>
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
                    variant="outline"
                    asChild
                  >
                    <Link href={option.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-muted/30 rounded-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Join Our Growing Community</h2>
            <p className="text-muted-foreground">
              Thousands of successful collaborations happen on QuestLink every month
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-sm text-muted-foreground">Active Quests</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Skilled Specialists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Professional Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">₱2M+</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Need Help Getting Started?</CardTitle>
            <CardDescription>
              Our team is here to help you make the most of QuestLink
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>Local & Remote</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/help">
                  View Help Center
                </Link>
              </Button>
              <Button asChild>
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
