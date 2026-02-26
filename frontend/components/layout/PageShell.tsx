import { PropsWithChildren } from 'react'

interface PageShellProps extends PropsWithChildren {
  width?: 'sm' | 'md' | 'lg'
}

const widthMap: Record<PageShellProps['width'], string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
}

export const PageShell = ({ children, width = 'lg' }: PageShellProps) => {
  return <div className={`mx-auto min-h-screen ${widthMap[width]} px-6 py-16 lg:px-10`}>{children}</div>
}
