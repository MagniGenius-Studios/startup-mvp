import Link from 'next/link'

// Hero section: value proposition + visual preview + primary CTA.
export const Hero = () => {
    return (
        <section className="relative overflow-hidden pt-32 pb-20">
            {/* Background glow effects */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#0ea5e9]/8 blur-[120px]" />
                <div className="absolute right-[-5%] top-[20%] h-[400px] w-[400px] rounded-full bg-[#10b981]/6 blur-[100px]" />
            </div>

            <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
                {/* Left – Copy */}
                <div className="space-y-8">
                    <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
                        Learn logic,
                        <br />
                        <span className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent">
                            not just
                        </span>
                        <br />
                        syntax.
                    </h1>

                    <p className="max-w-md text-lg leading-relaxed text-slate-400">
                        CodeByte&apos;s AI explains mistakes in plain English, helping you understand the &apos;why&apos; behind the code. Start your journey from beginner to builder today.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/register"
                            className="rounded-lg bg-[#0ea5e9] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0ea5e9]/90 hover:shadow-lg hover:shadow-[#0ea5e9]/25 hover:-translate-y-0.5"
                        >
                            Try the Demo
                        </Link>
                        <a
                            href="#tracks"
                            className="rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white hover:-translate-y-0.5"
                        >
                            View Syllabus
                        </a>
                    </div>
                </div>

                {/* Right – Code Editor Mockup */}
                <div className="relative">
                    {/* Code Editor */}
                    <div className="rounded-xl border border-slate-700/60 bg-[#0d1525] shadow-2xl shadow-black/40">
                        {/* Editor title bar */}
                        <div className="flex items-center gap-2 border-b border-slate-700/40 px-4 py-3">
                            <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                            <div className="h-3 w-3 rounded-full bg-[#eab308]" />
                            <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                            <span className="ml-3 text-xs text-slate-500">main.py</span>
                        </div>

                        {/* Code content */}
                        <div className="p-5 font-mono text-sm leading-7">
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">1</span>
                                <span>
                                    <span className="text-[#c084fc]">def</span>{' '}
                                    <span className="text-[#60a5fa]">calculate_avg</span>
                                    <span className="text-slate-300">(numbers):</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">2</span>
                                <span>
                                    <span className="text-slate-300">    total = </span>
                                    <span className="text-[#f59e0b]">5</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">3</span>
                                <span>
                                    <span className="text-[#c084fc]">    for</span>
                                    <span className="text-slate-300"> n </span>
                                    <span className="text-[#c084fc]">in</span>
                                    <span className="text-slate-300"> numbers:</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">4</span>
                                <span className="text-slate-300">        total += n</span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">5</span>
                                <span className="text-slate-500">    # Bug here: divides</span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">6</span>
                                <span className="text-slate-500">    # by len()</span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">7</span>
                                <span>
                                    <span className="text-[#c084fc]">    return</span>
                                    <span className="text-slate-300"> total /</span>
                                </span>
                            </div>
                            <div className="flex">
                                <span className="mr-4 select-none text-slate-600">8</span>
                                <span>
                                    <span className="text-slate-300">        </span>
                                    <span className="text-[#60a5fa]">len</span>
                                    <span className="text-slate-300">(numbers)</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI Feedback Card */}
                    <div className="absolute -right-4 top-12 w-64 rounded-xl border border-slate-700/60 bg-[#111827] p-4 shadow-2xl shadow-black/50 sm:right-[-30px]">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="text-sm">✨</span>
                            <span className="text-xs font-semibold text-white">AI Logic Check</span>
                        </div>

                        <div className="mb-3 rounded-lg bg-[#1c1917] p-3">
                            <p className="text-xs font-medium text-[#f97316]">Logic Error</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                Your code will crash if the list is empty.
                            </p>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-400">
                            In <span className="text-slate-300">line 7</span>, you haven&apos;t checked if{' '}
                            <code className="rounded bg-slate-800 px-1 py-0.5 text-[#0ea5e9]">numbers</code> is empty before dividing.
                            Consider adding a{' '}
                            <code className="rounded bg-slate-800 px-1 py-0.5 text-[#10b981]">len() {'>'} 0</code>{' '}check first.
                        </p>

                        <button className="mt-3 w-full rounded-lg bg-[#0ea5e9]/10 py-2 text-xs font-medium text-[#0ea5e9] transition hover:bg-[#0ea5e9]/20">
                            Auto-Fix Logic
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
