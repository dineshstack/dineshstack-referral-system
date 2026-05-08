import { ProgramDetailPage } from '@/components/program-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProgramDetail({ params }: Props) {
  const { id } = await params
  return <ProgramDetailPage id={Number(id)} />
}
