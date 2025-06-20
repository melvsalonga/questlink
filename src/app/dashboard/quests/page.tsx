import { Metadata } from 'next'
import { QuestsManagement } from '@/components/dashboard/QuestsManagement'

export const metadata: Metadata = {
  title: 'My Quests - QuestLink',
  description: 'Manage your posted quests and applications on QuestLink',
}

export default function DashboardQuestsPage() {
  return <QuestsManagement />
}
