import Link from 'next/link'

import { PageShell } from '@/components/layout/PageShell'

const features = [
  {
    title: 'AI code reviews that teach',
    body: 'Get targeted feedback that explains the why, not just the what, so learners build durable intuition.',
  },
  {
    title: 'Mastery tracking by concept',
    body: 'Understand progress at the concept level with prerequisite graphs and adaptive reinforcement.',
  },
  {
    title: 'Production-ready foundations',
    body: 'Built with App Router, API-boundary typing, and clean contracts between frontend and backend.',
  },
]

export default function HomePage() {
  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div className="text-lg font-display tracking-tight">CodeByte</div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="text-slate-200 transition hover:text-white">
            Login
          </Link>
          <Link href="/dashboard" className="button-primary">
            Launch App
          </Link>
        </div>
      </div>

      <section className="mt-24 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <p className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-300">
            AI-powered coding mentor
          </p>
          <h1 className="text-4xl font-display leading-tight text-white sm:text-5xl">
            Build confident developers with feedback loops designed for mastery.
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            CodeByte blends adaptive tracks, concept graphs, and LLM coaching so teams can onboard
            faster and learn smarter.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard" className="button-primary">
              Go to dashboard
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-slate-100 transition hover:border-white/40"
              href="#features"
            >
              See what&apos;s inside
            </a>
          </div>
        </div>

        <div className="card shadow-soft">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
            <span>Progress overview</span>
            <span className="rounded-full bg-mint/20 px-2 py-1 text-mint">Live</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-2xl font-display text-white">84%</div>
                <p className="text-slate-400">Track completion</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-2xl font-display text-white">127</div>
                <p className="text-slate-400">AI reviews</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-2xl font-display text-white">23</div>
                <p className="text-slate-400">Concept gaps</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Adaptive learning track</span>
                <span>Week 6</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/4 rounded-full bg-sky" />
              </div>
              <p className="text-sm text-slate-300">
                Next focus: recursion + stateful problem solving. Practice set recalibrated using latest
                submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-24 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="card border-white/5 bg-white/5">
            <h3 className="text-xl font-display text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.body}</p>
          </div>
        ))}
      </section>
    </PageShell>
  )
}
