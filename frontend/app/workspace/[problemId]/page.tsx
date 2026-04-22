import WorkspacePageClient from './WorkspacePageClient'

interface WorkspacePageProps {
  params: {
    problemId: string
  }
}

export default function WorkspaceProblemPage({ params }: WorkspacePageProps) {
  return <WorkspacePageClient problemId={params.problemId} />
}
