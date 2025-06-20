import { Metadata } from 'next'
import { QuestDetailsPage } from '@/components/quest/QuestDetailsPage'

interface QuestPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: QuestPageProps): Promise<Metadata> {
  return {
    title: `Quest Details - QuestLink`,
    description: 'View quest details and apply to work on this project',
  }
}

export default function QuestPage({ params }: QuestPageProps) {
  return <QuestDetailsPage questId={params.id} />
}
