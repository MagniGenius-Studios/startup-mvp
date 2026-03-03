import Link from 'next/link'

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0b1120]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#10b981]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5L3 12L8 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 5L21 12L16 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">CodeByte</span>
                </Link>

                {/* Nav Links */}
                <div className="hidden items-center gap-8 text-sm md:flex">
                    <a href="#how-it-works" className="text-slate-400 transition hover:text-white">
                        How It Works
                    </a>
                    <a href="#tracks" className="text-slate-400 transition hover:text-white">
                        Tracks
                    </a>
                    <a href="#pricing" className="text-slate-400 transition hover:text-white">
                        Pricing
                    </a>
                    <Link href="/login" className="text-slate-400 transition hover:text-white">
                        Login
                    </Link>
                </div>

                {/* CTA */}
                <Link
                    href="/register"
                    className="rounded-lg bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0ea5e9]/90 hover:shadow-lg hover:shadow-[#0ea5e9]/20"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    )
}
