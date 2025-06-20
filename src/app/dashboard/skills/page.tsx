import { Metadata } from 'next'
import { SkillsManagement } from '@/components/dashboard/SkillsManagement'

export const metadata: Metadata = {
  title: 'My Skills - QuestLink',
  description: 'Manage your skills and expertise on QuestLink',
}

export default function DashboardSkillsPage() {
  return <SkillsManagement />
}
