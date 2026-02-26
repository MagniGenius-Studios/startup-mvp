import { PropsWithChildren } from 'react'

type Width = 'sm' | 'md' | 'lg'

interface PageShellProps extends PropsWithChildren {
  width?: Width
}

const widthMap: Record<Width, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
}

export const PageShell = ({ children, width = 'lg' }: PageShellProps) => {
  return <div className={`mx-auto min-h-screen ${widthMap[width]} px-6 py-16 lg:px-10`}>{children}</div>
}
