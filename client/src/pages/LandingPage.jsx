import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CalendarClock,
  ChevronRight,
  Command,
  MessageSquareText,
  NotebookPen,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Product', href: '#product' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Launch', href: '#contact' },
]

const heroStats = [
  { value: '18.4K', label: 'active contacts in the workspace' },
  { value: '42', label: 'open conversations in the shared inbox' },
  { value: '3', label: 'campaign stages from draft to sent' },
]

const tickerItems = [
  'Contacts -> Segments -> Campaigns -> Inbox',
  'Built for lean marketing, sales, and operations teams',
  'Create campaigns, manage replies, and track results',
  'One workspace for outbound SMS operations',
  'Structured for product growth beyond the landing page',
]

const productCards = [
  {
    icon: RadioTower,
    title: 'Campaign orchestration',
    description:
      'Plan, schedule, and launch SMS campaigns from one structured workflow instead of switching between scattered tools.',
  },
  {
    icon: MessageSquareText,
    title: 'Shared inbox',
    description:
      'Keep every reply connected to the original campaign so follow-up stays fast, contextual, and organized.',
  },
  {
    icon: NotebookPen,
    title: 'Contact intelligence',
    description:
      'Store segments, notes, and campaign history in one place so every next message starts with context.',
  },
  {
    icon: ShieldCheck,
    title: 'Operational clarity',
    description:
      'Move from draft to sent with clear states, ownership, and visibility across the team.',
  },
]

const featureSpotlights = [
  {
    visual: 'timing',
    reverse: false,
    title: 'Improve send performance with better timing',
    dotClass: 'bg-[#7ea5ff]',
    points: [
      {
        title: 'Send when audiences are most responsive',
        description:
          'Use stronger timing signals to reach contacts when engagement is more likely to happen.',
      },
      {
        title: 'Reduce wasted message volume',
        description:
          'Better targeting and cleaner workflow decisions help campaigns stay efficient as volume grows.',
      },
      {
        title: 'Keep execution consistent',
        description:
          'Give teams a clear operating rhythm so campaigns are sent with more consistency and less guesswork.',
      },
    ],
  },
  {
    visual: 'analytics',
    reverse: true,
    title: 'Turn replies into measurable campaign insight',
    dotClass: 'bg-[#59b4ad]',
    points: [
      {
        title: 'Track reply patterns',
        description:
          'Understand which campaigns and send windows lead to real responses, not just message delivery.',
      },
      {
        title: 'Compare results by segment',
        description:
          'Review performance by audience and campaign type so the next send starts from evidence.',
      },
      {
        title: 'Speed up follow-up',
        description:
          'Keep high-intent replies visible so teams can route, respond, and act faster.',
      },
    ],
  },
  {
    visual: 'automation',
    reverse: false,
    title: 'Build a reliable workflow behind every campaign',
    dotClass: 'bg-[#ffc843]',
    points: [
      {
        title: 'Reuse campaign structures',
        description:
          'Standardize campaign setup so teams can move faster without rebuilding the same workflow each time.',
      },
      {
        title: 'Stay ready for integrations',
        description:
          'Keep the product ready for API, webhook, and reporting expansion without changing the core story.',
      },
      {
        title: 'Scale with clarity',
        description:
          'Support more users, more campaigns, and more conversations without losing operational visibility.',
      },
    ],
  },
]

const useCases = [
  {
    title: 'Promotions and launches',
    description:
      'Launch time-sensitive campaigns with clear audience targeting and reply handling.',
  },
  {
    title: 'Appointment reminders',
    description:
      'Send reminders or renewal prompts and manage every response from one inbox.',
  },
  {
    title: 'Lead follow-up',
    description:
      'Run lightweight follow-up campaigns with contact history, segments, and shared visibility.',
  },
]

const faqs = [
  {
    question: 'Who is CampaignHub for?',
    answer:
      'CampaignHub is designed for teams that need to run SMS campaigns, manage contact lists, and handle replies from one shared workspace.',
  },
  {
    question: 'What can teams manage in CampaignHub?',
    answer:
      'Teams can organize contacts, build campaigns, manage send states, and work from a shared inbox with campaign context attached.',
  },
  {
    question: 'Can this grow into the full product?',
    answer:
      'Yes. The current frontend structure supports expansion into auth, dashboard, contacts, campaigns, analytics, and inbox workflows.',
  },
]

const replyFeed = [
  {
    sender: 'Sarah',
    text: 'Can you reserve 2 seats for Friday?',
    tone: 'incoming',
    time: '09:14',
  },
  {
    sender: 'Team',
    text: 'Yes, I can confirm those now.',
    tone: 'outgoing',
    time: '09:15',
  },
  {
    sender: 'Sarah',
    text: 'Perfect, please send the payment link.',
    tone: 'incoming',
    time: '09:16',
  },
]

const campaignMoments = [
  { label: 'Audience ready', value: '4 cohorts synced' },
  { label: 'Scheduled for', value: 'Today · 11:45 AM' },
  { label: 'Inbox activity', value: '12 threads waiting' },
]

import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-7rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(243,167,106,0.35),_transparent_68%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(120,170,152,0.28),_transparent_68%)] blur-3xl" />
        <div className="absolute left-1/3 top-[40rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(87,72,124,0.18),_transparent_68%)] blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 px-5 pb-6 pt-5 shadow-[0_28px_100px_rgba(44,33,26,0.12)] backdrop-blur-xl sm:px-8 lg:rounded-[2.5rem] lg:px-10 lg:pb-8">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0))]" />
          <nav className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="font-['Outfit'] text-sm font-semibold uppercase tracking-[0.24em] text-[var(--ink)]">
                  CampaignHub
                </p>
                <p className="text-sm text-[var(--muted)]">
                  SMS campaigns + shared inbox workspace
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--accent-strong)]"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[#e89b5a] hover:shadow-[0_16px_35px_rgba(31,23,47,0.12)]"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>

          <div className="relative mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="max-w-[560px]">
              <SectionPill>SMS campaign workspace</SectionPill>
              <h1 className="mt-5 max-w-[10ch] font-['Outfit'] text-[3rem] font-semibold leading-[0.9] tracking-[-0.055em] text-[var(--ink)] sm:text-[4rem] lg:text-[4.85rem]">
                Run SMS campaigns and customer replies from one shared workspace.
              </h1>
              <p className="mt-5 max-w-[33rem] text-base leading-7 text-[var(--muted)] sm:text-lg">
                CampaignHub helps teams plan sends, manage audiences, and handle replies without switching between separate tools.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="#product"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[#f0b37d]"
                >
                  See product overview
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,23,47,0.12)] bg-[rgba(255,255,255,0.75)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:border-[rgba(31,23,47,0.22)]"
                >
                  View workflow
                  <Workflow className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-[rgba(31,23,47,0.08)] bg-[rgba(255,255,255,0.7)] p-4 shadow-[0_12px_30px_rgba(31,23,47,0.05)]"
                  >
                    <p className="font-['Outfit'] text-[2rem] font-semibold tracking-[-0.05em] text-[var(--ink)]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <HeroPreview />
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[1.55rem] border border-[rgba(31,23,47,0.06)] bg-[rgba(246,240,232,0.82)] py-2.5">
            <div className="marquee-track flex min-w-max items-center gap-4 px-4">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-4 whitespace-nowrap"
                >
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink)]">
                    {item}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="product"
          className="grid gap-10 px-2 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-4 lg:py-24"
        >
          <div className="max-w-[34rem]">
            <SectionPill>Product overview</SectionPill>
            <h2 className="mt-5 font-['Outfit'] text-[2.7rem] font-semibold leading-[1] tracking-[-0.05em] text-[var(--ink)] sm:text-[3.5rem]">
              Contact management, campaign execution, and inbox workflows in one system.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
              CampaignHub brings together the core workflows teams need to launch SMS campaigns, manage audiences, and respond from a shared inbox with clear context.
            </p>

            <div className="mt-8 space-y-4">
              {useCases.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.6rem] border border-[rgba(31,23,47,0.08)] bg-[rgba(255,255,255,0.68)] p-5 shadow-[0_16px_40px_rgba(31,23,47,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(31,23,47,0.08)] text-[var(--ink)]">
                      <BadgeCheck className="h-5 w-5" />
                    </span>
                    <p className="text-base font-semibold text-[var(--ink)]">
                      {item.title}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {productCards.map((card) => {
              const Icon = card.icon

              return (
                <article
                  key={card.title}
                  className="rounded-[2rem] border border-[rgba(31,23,47,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,244,239,0.82))] p-6 shadow-[0_20px_55px_rgba(31,23,47,0.07)] transition hover:-translate-y-1"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--ink)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-[var(--ink)]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {card.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="workflow" className="space-y-16 px-2 py-10 lg:px-4 lg:py-18">
          {featureSpotlights.map((feature) => (
            <FeatureSpotlight key={feature.title} feature={feature} />
          ))}
        </section>

        <section id="contact" className="pb-8 pt-4 lg:pb-16">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2.3rem] border border-[rgba(31,23,47,0.08)] bg-[linear-gradient(145deg,rgba(242,219,196,0.92),rgba(255,255,255,0.9))] p-6 shadow-[0_24px_70px_rgba(31,23,47,0.08)] sm:p-8 lg:p-10">
              <SectionPill>Get started</SectionPill>
              <h2 className="mt-5 max-w-[32rem] font-['Outfit'] text-[2.6rem] font-semibold leading-[1] tracking-[-0.05em] text-[var(--ink)] sm:text-[3.5rem]">
                Bring campaigns, contacts, and customer replies into one clear workspace.
              </h2>
              <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[var(--muted)]">
                CampaignHub gives teams a simpler way to launch SMS campaigns, manage audiences, and handle replies with shared visibility across the workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Start with CampaignHub
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,23,47,0.12)] bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
                >
                  Explore workflow
                  <Command className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="faq-card group rounded-[1.8rem] border border-[rgba(31,23,47,0.08)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_18px_50px_rgba(31,23,47,0.06)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[var(--ink)]">
                    {item.question}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(31,23,47,0.06)] text-[var(--ink)] transition group-open:rotate-45">
                      <Zap className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-4 pr-6 text-sm leading-7 text-[var(--muted)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 px-2 pt-6 text-sm text-[var(--muted)] lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <p>CampaignHub for modern SMS campaign and inbox operations.</p>
          </div>
          <p>Built to support campaigns, contacts, analytics, and shared reply workflows.</p>
        </footer>
      </main>
    </div>
  )
}

function SectionPill({ children, dark = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
        dark
          ? 'bg-white/10 text-white'
          : 'bg-[rgba(31,23,47,0.06)] text-[var(--accent-strong)]'
      }`}
    >
      {children}
    </span>
  )
}

function BrandMark({ compact = false }) {
  return (
    <span
      className={`grid place-items-center rounded-[1.1rem] bg-[var(--ink)] text-white shadow-[0_16px_32px_rgba(31,23,47,0.22)] ${
        compact ? 'h-9 w-9' : 'h-11 w-11'
      }`}
    >
      <span className="relative block h-5 w-5">
        <span className="absolute inset-0 rounded-full border-2 border-white/85" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
      </span>
    </span>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[41.5rem] lg:pl-3">
      <div className="widget-chip float-slow absolute -left-4 top-12 hidden lg:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
        148 contacts synced this morning
      </div>
      <div className="widget-chip float-delayed absolute -right-2 bottom-10 hidden lg:flex">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--seafoam)]" />
        12 reply threads waiting for review
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.62))] p-4 shadow-[0_30px_90px_rgba(31,23,47,0.14)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[0.92fr_1fr] lg:items-stretch">
          <div className="rounded-[1.9rem] bg-[linear-gradient(180deg,#231a31,#17111f)] p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Campaign studio
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  Friday flash drop
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Scheduled
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {campaignMoments.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-2.5"
                >
                  <span className="text-sm text-white/64">{item.label}</span>
                  <span className="whitespace-nowrap text-sm font-semibold text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Message pulse
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Live preview
                </p>
              </div>
              <div className="mt-4 flex h-16 items-end gap-2">
                {[32, 48, 40, 68, 54, 82, 60, 96].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className={`w-full rounded-t-full ${
                      index % 3 === 0
                        ? 'bg-[rgba(243,167,106,0.9)]'
                        : index % 2 === 0
                          ? 'bg-[rgba(120,170,152,0.86)]'
                          : 'bg-white/70'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[rgba(31,23,47,0.08)] bg-white p-5 shadow-[0_20px_55px_rgba(31,23,47,0.07)] lg:h-full">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Shared inbox
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                  Replies never leave the campaign context
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--ink)]">
                <MessageSquareText className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {replyFeed.map((message) => (
                <div
                  key={`${message.sender}-${message.time}`}
                  className={`max-w-[88%] rounded-[1.3rem] px-4 py-3 ${
                    message.tone === 'outgoing'
                      ? 'ml-auto bg-[var(--ink)] text-white'
                      : 'bg-[rgba(31,23,47,0.06)] text-[var(--ink)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em]">
                    <span>{message.sender}</span>
                    <span
                      className={
                        message.tone === 'outgoing'
                          ? 'text-white/60'
                          : 'text-[var(--muted)]'
                      }
                    >
                      {message.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{message.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <div className="flex min-h-[7.75rem] flex-col rounded-[1.75rem] border border-[rgba(31,23,47,0.08)] bg-[rgba(243,167,106,0.2)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Segment widget
              </p>
              <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[var(--ink)]">
                VIP buyers
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                {['Repeat', 'High intent', 'Weekend'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex min-h-[7.75rem] flex-col rounded-[1.75rem] border border-[rgba(31,23,47,0.08)] bg-[rgba(120,170,152,0.16)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Insight widget
              </p>
              <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-[var(--ink)]">
                34% reply rate
              </p>
              <p className="mt-auto pt-3 text-sm leading-6 text-[var(--muted)]">
                Best lift came from reminder review sends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureSpotlight({ feature }) {
  const textBlock = (
    <div className="max-w-[34rem]">
      <h2 className="text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--ink)] sm:text-[3rem]">
        {feature.title}
      </h2>
      <div className="mt-8 space-y-7">
        {feature.points.map((point) => (
          <div key={point.title} className="flex items-start gap-4">
            <span
              className={`mt-2.5 h-3 w-3 flex-none rounded-full ${feature.dotClass}`}
            />
            <div>
              <h3 className="text-xl font-semibold text-[var(--ink)]">
                {point.title}
              </h3>
              <p className="mt-2 text-base leading-8 text-[var(--muted)]">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const visualBlock = <FeatureGraphic type={feature.visual} />

  return (
    <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
      {feature.reverse ? (
        <>
          <div className="order-2 lg:order-1">{textBlock}</div>
          <div className="order-1 lg:order-2">{visualBlock}</div>
        </>
      ) : (
        <>
          <div>{visualBlock}</div>
          <div>{textBlock}</div>
        </>
      )}
    </div>
  )
}

function FeatureGraphic({ type }) {
  if (type === 'timing') {
    return (
      <div className="relative mx-auto w-full max-w-[40rem] overflow-hidden rounded-[2.3rem] bg-[#c9d9ff] p-6 shadow-[0_24px_60px_rgba(31,23,47,0.08)]">
        <div className="relative h-[20rem] sm:h-[22rem]">
          <div className="absolute left-8 top-16 flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[#ffc94d] text-[var(--ink)] shadow-[0_12px_30px_rgba(31,23,47,0.08)]">
            <CalendarClock className="h-6 w-6" />
          </div>

          <div className="absolute right-3 top-3 w-[74%] rounded-[1.7rem] bg-white/70 p-4 shadow-[0_16px_35px_rgba(31,23,47,0.08)]">
            <div className="mx-auto flex w-fit overflow-hidden rounded-[1rem] bg-[#d7dbe0] text-sm font-semibold text-[var(--ink)]">
              <span className="bg-[#eff4f9] px-6 py-3">Top days</span>
              <span className="px-6 py-3 text-black/55">Top social</span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Sunday', '71.21%', 'w-[72%]', 'bg-[#7ea5ff]'],
                ['Monday', '14.20%', 'w-[22%]', 'bg-[#ffc843]'],
                ['Tuesday', '24.92%', 'w-[32%]', 'bg-[#ffc843]'],
                ['Wednesday', '2.30%', 'w-[10%]', 'bg-[#ffc843]'],
              ].map(([day, value, width, color]) => (
                <div
                  key={day}
                  className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 rounded-[1rem] bg-white/75 px-4 py-3"
                >
                  <span className="text-sm text-[var(--ink)]">{day}</span>
                  <span className="h-8 rounded-full bg-[#eef2f5]">
                    <span className={`block h-full rounded-full ${width} ${color}`} />
                  </span>
                  <span className="text-sm font-medium text-[var(--ink)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-12 w-[46%] rounded-[1.6rem] bg-white p-4 shadow-[0_16px_35px_rgba(31,23,47,0.08)]">
            <div className="flex h-28 items-end gap-2">
              {[52, 86, 40, 66, 22, 45, 71].map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-full rounded-t-[0.5rem] bg-[#63c0bd]"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-[var(--ink)]/70">
              {['12', '2', '4', '6', '8', '10', '12'].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'analytics') {
    return (
      <div className="relative mx-auto w-full max-w-[40rem] overflow-hidden rounded-[2.3rem] bg-[#85c1ba] p-6 shadow-[0_24px_60px_rgba(31,23,47,0.08)]">
        <div className="relative h-[20rem] sm:h-[22rem]">
          <div className="absolute left-8 bottom-8 flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[#ffc94d] text-[var(--ink)] shadow-[0_12px_30px_rgba(31,23,47,0.08)]">
            <BarChart3 className="h-6 w-6" />
          </div>

          <div className="absolute left-20 top-4 w-[64%] rounded-[1.6rem] bg-white p-4 shadow-[0_18px_40px_rgba(31,23,47,0.1)]">
            <div className="rounded-[1.1rem] bg-[#fbfcfd] p-3">
              <svg viewBox="0 0 360 180" className="h-[11rem] w-full">
                {[20, 50, 80, 110, 140].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    y1={line}
                    x2="360"
                    y2={line}
                    stroke="#dde5eb"
                    strokeWidth="1"
                  />
                ))}
                <polyline
                  fill="none"
                  stroke="#7ea5ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="30,135 70,155 110,155 170,85 220,120 280,120 330,30"
                />
                {[
                  [30, 135],
                  [70, 155],
                  [110, 155],
                  [170, 85],
                  [220, 120],
                  [280, 120],
                  [330, 30],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="#7ea5ff" />
                ))}
              </svg>
            </div>
          </div>

          <div className="absolute bottom-4 left-[34%] w-[58%] rounded-[1.5rem] bg-white/92 p-4 shadow-[0_16px_35px_rgba(31,23,47,0.08)]">
            <div className="space-y-3">
              {[
                ['Monday', '90.6%'],
                ['Tuesday', '15.37%'],
                ['Wednesday', '26.5%'],
                ['Thursday', '30.7%'],
              ].map(([day, value]) => (
                <div key={day} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="rounded-[0.85rem] bg-white px-3 py-2 text-sm text-[var(--ink)] shadow-[0_6px_18px_rgba(31,23,47,0.05)]">
                    {day}
                  </span>
                  <span className="rounded-[0.85rem] bg-[#d0efeb] px-3 py-2 text-sm font-medium text-[var(--ink)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-[40rem] overflow-hidden rounded-[2.3rem] bg-[#fff0ba] p-6 shadow-[0_24px_60px_rgba(31,23,47,0.08)]">
      <div className="relative h-[20rem] sm:h-[22rem]">
        <div className="absolute left-[36%] top-2 rounded-[0.9rem] bg-[#c7d9ff] px-5 py-2 text-sm font-semibold text-[var(--ink)] shadow-[0_10px_24px_rgba(31,23,47,0.08)]">
          API Response
        </div>

        <div className="absolute bottom-7 left-7 h-[10rem] w-[24%] rounded-[1.6rem] bg-white/72" />

        <div className="absolute left-4 bottom-16 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#ffc94d] text-sm font-bold text-[var(--ink)] shadow-[0_12px_30px_rgba(31,23,47,0.08)]">
          API
        </div>
        <div className="absolute bottom-0 left-4 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#ffc94d] text-[var(--ink)] shadow-[0_12px_30px_rgba(31,23,47,0.08)]">
          <Sparkles className="h-5 w-5" />
        </div>

        <div className="absolute right-5 top-8 w-[65%] rounded-[1.6rem] bg-white p-4 shadow-[0_18px_40px_rgba(31,23,47,0.1)]">
          <div className="grid grid-cols-[6rem_1fr] gap-4">
            <div className="space-y-3">
              {['Hours', 'Days', 'Months'].map((tab, index) => (
                <div
                  key={tab}
                  className={`rounded-[0.95rem] px-4 py-3 text-sm font-medium ${
                    index === 0
                      ? 'bg-white shadow-[0_6px_18px_rgba(31,23,47,0.05)]'
                      : 'bg-[#f7f8fa] text-[var(--ink)]'
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-5 text-xs text-[#8ea2bf]">
                {[
                  ['12 PM', 0],
                  ['10 AM', 2],
                  ['08 AM', 4],
                  ['06 AM', 6],
                ].map(([label, row]) => (
                  <div key={label} className="contents">
                    <span className="self-center">{label}</span>
                    <span
                      className="h-px self-center bg-[#dfe6ef]"
                      style={{ gridRow: `${Number(row) + 1}` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex h-36 items-end gap-2">
                {[20, 32, 58, 44, 66, 74, 68, 84, 100].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-full rounded-t-[0.55rem] bg-[#7ea5ff]"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[1rem] bg-[#f7f8fa] px-4 py-3">
                <span className="rounded-[0.85rem] bg-[#c7d9ff] px-3 py-2 font-semibold text-[var(--ink)]">
                  543
                </span>
                <span className="text-sm text-[var(--ink)]/80">
                  Secure links created
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
