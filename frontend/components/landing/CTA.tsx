import Link from 'next/link'

export const CTA = () => {
    return (
        <section className="relative border-t border-slate-800 py-28">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0ea5e9]/5 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-2xl px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Ready to decode your
                    <br />
                    potential?
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-400">
                    Join thousands of learners who are mastering the logic of programming, not just memorizing syntax.
                </p>
                <div className="mt-9">
                    <Link
                        href="/register"
                        className="inline-block rounded-xl bg-[#0ea5e9] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#0ea5e9]/90 hover:shadow-xl hover:shadow-[#0ea5e9]/20 hover:-translate-y-0.5"
                    >
                        Start Learning for Free
                    </Link>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                    No credit card required for basic tracks.
                </p>
            </div>
        </section>
    )
}
