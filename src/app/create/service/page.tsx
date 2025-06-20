import { Metadata } from 'next'
import { ServiceCreationForm } from '@/components/service/ServiceCreationForm'

export const metadata: Metadata = {
  title: 'Create Service - QuestLink',
  description: 'Add a new service to your business profile and attract more clients',
}

export default function CreateServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Create Your Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcase your business services and attract clients. Define your offerings, 
              set your availability, and grow your customer base.
            </p>
          </div>
          
          <ServiceCreationForm />
        </div>
      </div>
    </div>
  )
}
