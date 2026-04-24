const features = [
    {
        step: '1',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5L3 12L8 19" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 5L21 12L16 19" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Write Real Code',
        description:
            'Practice in a real-world environment right from your browser. No setup required, just pure logic building.',
    },
    {
        step: '2',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L19 12L5 21V3Z" fill="#0ea5e9" />
            </svg>
        ),
        title: 'Instant Submit',
        description:
            "Get immediate analysis. We don't just check for syntax errors, we check if your problem-solving approach is sound.",
    },
    {
        step: '3',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#0ea5e9" strokeWidth="2" />
                <path d="M12 7V12L15 15" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Deep Understanding',
        description:
            'Receive plain-language feedback that translates "Error 404" to concepts you actually understand.',
    },
]

// Features section: explains the product workflow in three steps.
export const Features = () => {
    return (
        <section id="how-it-works" className="relative border-t border-slate-800 py-24">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="max-w-xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        From Confusion to Clarity
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-400">
                        Traditional coding tutorials dump syntax on you. CodeByte focuses on the logic, guiding you through the thinking process step-by-step.
                    </p>
                </div>

                {/* Feature cards */}
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.step}
                            className="group rounded-xl border border-slate-800 bg-[#111827] p-7 transition hover:border-slate-700 hover:bg-[#151c2e]"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0ea5e9]/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                                {feature.step}. {feature.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
