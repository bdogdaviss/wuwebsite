import { Metadata } from 'next'
import { CTAButtons } from '@/components/CTAButtons'
import { Section } from '@/components/Section'
import { FadeIn } from '@/components/FadeIn'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'Features',
  description: 'Discover all the powerful features WakeUp offers to help you focus better.',
})

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Focus Sessions',
    desc: 'Start a focus session with one click and track your productive time. WakeUp automatically tracks how long you stay focused and gives you insights into your habits.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: 'Block Rules',
    desc: 'Create custom rules to block distracting websites during focus sessions. Pattern-based blocking lets you define exactly what counts as a distraction.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Analytics',
    desc: 'See how your focus habits are improving over time. Daily, weekly, and monthly breakdowns show your productive streaks and help you stay accountable.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Privacy & Security',
    desc: 'Your data stays yours. End-to-end encryption, no tracking, and full data export. We never sell your information or share it with third parties.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Community',
    desc: 'Connect with people who are awake and focused at the same time. Join nests, chat in channels, and build accountability with like-minded people.',
  },
]

export default function FeaturesPage() {
  return (
    <>
      <section className="py-14 pt-24 relative overflow-hidden" style={{ background: '#070B14' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/8 blur-3xl" />
        </div>
        <div className="max-w-screen-xl mx-auto px-4 gap-16 justify-between md:px-8 lg:flex relative">
          <div>
            <FadeIn direction="none">
              <div className="max-w-xl space-y-3">
                <h3 className="text-gray-400 font-semibold tracking-wide uppercase text-sm">
                  Features
                </h3>
                <p className="text-white text-3xl font-semibold sm:text-4xl">
                  Simple solutions for better focus
                </p>
                <p className="text-gray-400">
                  WakeUp gives you everything you need to block distractions, track focus time, and build productive habits that stick.
                </p>
              </div>
            </FadeIn>
            <div className="mt-12 max-w-lg lg:max-w-none">
              <ul className="space-y-8">
                {features.map((item, idx) => (
                  <FadeIn key={idx} delay={0.1 * idx}>
                    <li className="flex gap-x-4">
                      <div className="flex-none w-12 h-12 bg-gray-800 text-gray-300 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg text-white font-semibold">
                          {item.title}
                        </h4>
                        <p className="mt-3 text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  </FadeIn>
                ))}
              </ul>
            </div>
          </div>
          <FadeIn direction="right" delay={0.2}>
            <div className="mt-12 lg:mt-0 flex items-center">
              <img
                src="/screenshots/screen2.png"
                alt="WakeUp App"
                className="w-full shadow-lg rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <Section
        variant="glow"
        glow={
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/12 blur-3xl" />
        }
      >
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start using these features today</h2>
            <p className="text-lg text-gray-300 mb-10">Create your free account and start focusing better.</p>
            <CTAButtons size="large" className="justify-center" />
          </div>
        </FadeIn>
      </Section>
    </>
  )
}
