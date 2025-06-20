import { Metadata } from 'next'
import { ServicesManagement } from '@/components/dashboard/ServicesManagement'

export const metadata: Metadata = {
  title: 'My Services - QuestLink',
  description: 'Manage your business services and offerings on QuestLink',
}

export default function DashboardServicesPage() {
  return <ServicesManagement />
}
