import { Metadata } from 'next'
import { SkillCreationForm } from '@/components/skill/SkillCreationForm'

export const metadata: Metadata = {
  title: 'Create Skill - QuestLink',
  description: 'Add a new skill to your profile and start earning from your expertise',
}

export default function CreateSkillPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-green-900/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Add Your Skill
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcase your expertise and start earning from your skills. Set your rates, 
              describe your experience, and connect with clients who need your talents.
            </p>
          </div>
          
          <SkillCreationForm />
        </div>
      </div>
    </div>
  )
}
