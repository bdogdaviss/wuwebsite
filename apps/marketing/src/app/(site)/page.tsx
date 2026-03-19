import { Section } from '@/components/Section'
import { CTAButtons } from '@/components/CTAButtons'
import { FlyingLogo } from '@/components/FlyingLogo'
import { HelpFloatButtons } from '@/components/HelpFloatButtons'
import { WelcomeNotification } from '@/components/WelcomeNotification'
import { AppScreensCarousel } from '@/components/AppScreensCarousel'
import { UserRating } from '@/components/UserRating'

import { HowItWorksSteps } from '@/components/HowItWorksSteps'
import { LightRays } from '@/components/LightRays'
import { FadeIn } from '@/components/FadeIn'
import { ExitIntentModal } from '@/components/ExitIntentModal'

export default function HomePage() {
  return (
    <>
      <ExitIntentModal />
      <WelcomeNotification />
      <FlyingLogo />
      {/* Hero — biggest glow: blue center + purple offset */}
      <Section className="pt-24 md:pt-32 relative overflow-hidden">
        <LightRays />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-120px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute right-[-120px] top-[120px] h-[360px] w-[420px] rounded-full bg-indigo-500/12 blur-3xl" />
        </div>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <FadeIn direction="none">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-8 px-2">
              WakeUp with people
              <br />
              <span className="text-brand-600">who are awake right now</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto px-2">
              WakeUp helps you block distractions, track focus time, and build productive habits
              that stick. Start your journey to better focus today.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <CTAButtons size="large" className="justify-center" />
          </FadeIn>
        </div>
      </Section>

      {/* App Screenshots — medium glow */}
      <Section
        variant="glow"
        glow={
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        }
      >
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See it in action
            </h2>
            <p className="text-lg text-gray-400">
              A look inside the WakeUp experience
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div style={{ marginBottom: 32 }}>
            <UserRating />
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <AppScreensCarousel />
        </FadeIn>
      </Section>

      {/* How it works — subtle vertical fade transition */}
      <Section variant="fade">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-400">
              Click each step to learn more
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <HowItWorksSteps />
        </FadeIn>
      </Section>

      {/* Final CTA — dramatic glow (second biggest) */}
      <Section
        variant="glow"
        glow={
          <>
            <div className="absolute left-1/2 top-1/2 h-[480px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute left-[-80px] top-[80px] h-[300px] w-[380px] rounded-full bg-indigo-500/10 blur-3xl" />
          </>
        }
      >
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to take control of your focus?
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of people who are building better focus habits with WakeUp.
              Start free today.
            </p>
            <CTAButtons size="large" className="justify-center" />
          </div>
        </FadeIn>
      </Section>

      <HelpFloatButtons />
    </>
  )
}
