const tracks = [
    {
        title: 'Web Development',
        tag: 'React + Node.js',
        description: 'Build modern full-stack websites from scratch.',
        gradient: 'from-[#0ea5e9]/30 to-[#6366f1]/30',
        border: 'border-[#0ea5e9]/20',
    },
    {
        title: 'Data Science',
        tag: 'Python + Pandas',
        description: 'Analyze data and build predictive models.',
        gradient: 'from-[#10b981]/30 to-[#0ea5e9]/30',
        border: 'border-[#10b981]/20',
    },
    {
        title: 'System Design',
        tag: 'Scalability',
        description: 'Architect scalable apps for millions of users.',
        gradient: 'from-[#8b5cf6]/30 to-[#ec4899]/30',
        border: 'border-[#8b5cf6]/20',
    },
]

export const Tracks = () => {
    return (
        <section id="tracks" className="relative border-t border-slate-800 py-24">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header row */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Master the tracks that matter
                        </h2>
                        <p className="mt-3 text-base text-slate-400">
                            Curated learning paths designed to take you from zero to deployed.
                        </p>
                    </div>
                    <a
                        href="#tracks"
                        className="flex items-center gap-1.5 text-sm font-medium text-[#0ea5e9] transition hover:text-[#0ea5e9]/80"
                    >
                        View all tracks
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>

                {/* Track cards */}
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {tracks.map((track) => (
                        <div
                            key={track.title}
                            className={`group cursor-pointer overflow-hidden rounded-xl border ${track.border} bg-[#111827] transition hover:border-slate-600`}
                        >
                            {/* Gradient top area */}
                            <div className={`relative h-40 bg-gradient-to-br ${track.gradient} p-5`}>
                                <span className="inline-block rounded-md bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    {track.tag}
                                </span>
                            </div>
                            {/* Card body */}
                            <div className="p-5">
                                <h3 className="text-base font-semibold text-white">{track.title}</h3>
                                <p className="mt-2 text-sm text-slate-400">{track.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
