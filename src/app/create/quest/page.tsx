import { Metadata } from 'next'
import { QuestCreationForm } from '@/components/quest/QuestCreationForm'

export const metadata: Metadata = {
  title: 'Create Quest - QuestLink',
  description: 'Post a new quest and find the perfect specialist for your project',
}

export default function CreateQuestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Create Your Quest
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Post your project and connect with skilled specialists who can bring your vision to life. 
              Describe your requirements, set your budget, and find the perfect match.
            </p>
          </div>
          
          <QuestCreationForm />
        </div>
      </div>
    </div>
  )
}
