import Link from 'next/link'

// Landing footer: brand, utility links, and copyright.
export const Footer = () => {
    return (
        <footer className="border-t border-slate-800 bg-[#0a0f1a]">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#10b981]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5L3 12L8 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 5L21 12L16 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">CodeByte</span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6 text-xs text-slate-500">
                    <a href="#" className="transition hover:text-slate-300">Privacy</a>
                    <a href="#" className="transition hover:text-slate-300">Terms</a>
                    <a href="#" className="transition hover:text-slate-300">Twitter</a>
                    <a href="#" className="transition hover:text-slate-300">GitHub</a>
                </div>

                {/* Copyright */}
                <p className="text-xs text-slate-600">
                    © 2025 CodeByte Inc.
                </p>
            </div>
        </footer>
    )
}
