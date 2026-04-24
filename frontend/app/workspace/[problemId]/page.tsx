import WorkspacePageClient from './WorkspacePageClient'

interface WorkspacePageProps {
  params: {
    problemId: string
  }
}

// Server wrapper: forwards route param to client workspace implementation.
export default function WorkspaceProblemPage({ params }: WorkspacePageProps) {
  return <WorkspacePageClient problemId={params.problemId} />
}
