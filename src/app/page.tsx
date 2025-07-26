import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { QuestCard } from "@/components/ui/quest-card";
import { SkillCard } from "@/components/ui/skill-card";
import { ServiceCard } from "@/components/ui/service-card";
import { Badge } from "@/components/ui/badge";
import { Sword, Users, Star, ArrowRight, Zap, Shield, Heart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Sample data for preview cards
  const sampleQuest = {
    id: '1',
    title: 'Website Development for Local Bakery',
    description: 'Need a professional website with online ordering system for my bakery business.',
    pricing: 15000,
    start_date: '2025-07-01',
    end_date: '2025-07-15',
    start_time: '09:00',
    end_time: '17:00',
    tags: ['Web Development', 'Business'],
    location: 'Quezon City',
    status: 'open' as const,
    quest_owner_id: '1',
    created_at: '2025-06-20',
    updated_at: '2025-06-20',
    users: {
      first_name: 'Maria',
      last_name: 'Santos',
      profiles: [{
        profile_picture: '',
        location: 'Quezon City'
      }]
    }
  }

  const sampleSkill = {
    id: '1',
    skill_name: 'React Development',
    skill_category: 'Web Development',
    proficiency: 'advanced' as const,
    pricing: 750,
    time_cost_per_hour: 60,
    is_active: true,
    user_id: '1',
    created_at: '2025-06-20',
    updated_at: '2025-06-20',
    users: {
      first_name: 'John',
      last_name: 'Doe',
      profiles: [{
        profile_picture: '',
        location: 'Manila'
      }]
    }
  }

  const sampleService = {
    id: '1',
    title: 'Computer Repair & Maintenance',
    description: 'Professional computer diagnosis and repair services for homes and businesses.',
    pricing: 500,
    category_tags: ['Technology', 'Professional Services'],
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_time: '9:00 AM - 6:00 PM',
    is_active: true,
    service_provider_id: '1',
    created_at: '2025-06-20',
    updated_at: '2025-06-20',
    service_providers: {
      id: '1',
      user_id: '1',
      title: 'TechFix Solutions',
      description: 'Professional tech services',
      location: 'Makati City',
      is_verified: true,
      verification_documents: [],
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      available_time: '9:00 AM - 6:00 PM',
      created_at: '2025-06-20',
      updated_at: '2025-06-20',
      users: {
        first_name: 'Mike',
        last_name: 'Wilson',
        profiles: [{
          profile_picture: ''
        }]
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          {/* Floating elements for anime aesthetic */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>

          <div className="relative container mx-auto px-4 py-24 sm:py-32">
            <div className="text-center space-y-8">
              {/* Logo/Brand */}
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="relative">
                  <Sword className="h-10 w-10 text-primary animate-float" />
                  <div className="absolute inset-0 h-10 w-10 bg-primary/20 rounded-full animate-glow"></div>
                </div>
                <h1 className="text-5xl sm:text-7xl font-bold text-primary">
                  QuestLink
                </h1>
              </div>

              {/* Tagline */}
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                  Real-World Quests. Real-Time Connections.
                </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A freelance marketplace platform by <span className="font-semibold text-primary">Cirqle</span>, inspired by anime guild boards.
                Connect with specialists, post quests, and discover services in your area.
                <span className="block mt-2 text-primary font-medium">Join the adventure today!</span>
              </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <Button variant="quest" size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-8 py-3" asChild>
                  <Link href="/auth/register" className="flex items-center justify-center whitespace-nowrap">
                    Start Your Quest
                    <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-primary/10 transition-all duration-300 text-lg px-8 py-3" asChild>
                  <Link href="/skills" className="flex items-center justify-center">
                    Browse Specialists
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,000+</div>
                  <div className="text-sm text-muted-foreground">Active Quests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-muted-foreground">Specialists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">200+</div>
                  <div className="text-sm text-muted-foreground">Services</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Explore What's Available
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get a taste of the amazing quests, skills, and services on QuestLink
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sample Quest */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="quest">Featured Quest</Badge>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
                <QuestCard quest={sampleQuest} showActions={false} />
              </div>

              {/* Sample Skill */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="skill">Top Specialist</Badge>
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <SkillCard skill={sampleSkill} showActions={false} rating={4.8} />
              </div>

              {/* Sample Service */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="service">Verified Service</Badge>
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <ServiceCard service={sampleService} showActions={false} rating={4.9} />
              </div>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="/quests" className="flex items-center justify-center whitespace-nowrap">
                  View All Opportunities
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How QuestLink Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple ways to connect and get things done
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* QuestBoard */}
              <div className="text-center p-8 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sword className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">QuestBoard</h3>
                <p className="text-muted-foreground">
                  Post tasks and projects you need help with. From quick errands to complex projects.
                </p>
              </div>

              {/* SkillBoard */}
              <div className="text-center p-8 rounded-lg border bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-800 dark:to-slate-700">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">SkillBoard</h3>
                <p className="text-muted-foreground">
                  Find and hire skilled specialists for your projects. Browse by expertise and availability.
                </p>
              </div>

              {/* Service Providers */}
              <div className="text-center p-8 rounded-lg border bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Service Providers</h3>
                <p className="text-muted-foreground">
                  Discover local businesses and services. From food delivery to professional services.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
