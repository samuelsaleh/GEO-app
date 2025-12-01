'use client'

import { useState } from 'react'
import { ArrowRight, Search, FileText, Wrench, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  icon: React.ElementType
  cardTitle: string
  cardDescription: string
  features: string[]
  link: string
  linkText: string
}

const steps: Step[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    icon: Search,
    cardTitle: 'AI Visibility Analysis',
    cardDescription: 'We analyze how ChatGPT, Claude, Gemini, and Perplexity perceive your brand compared to competitors.',
    features: [
      'Brand mention frequency',
      'Competitor comparison',
      'Sentiment analysis',
      'Share of voice metrics',
    ],
    link: '/tools/ai-visibility',
    linkText: 'Try Free Tool',
  },
  {
    id: 'planning',
    title: 'Planning',
    icon: FileText,
    cardTitle: 'GEO Audit Report',
    cardDescription: 'Deep technical analysis of your website structure, schema markup, and content citability.',
    features: [
      'Schema validation',
      'Content structure review',
      'Citability scoring',
      'Priority recommendations',
    ],
    link: '/tools/health-check',
    linkText: 'Run Free Audit',
  },
  {
    id: 'execution',
    title: 'Execution',
    icon: Wrench,
    cardTitle: 'Implementation',
    cardDescription: 'We optimize your content structure, add proper schema markup, and improve AI discoverability.',
    features: [
      'Schema generation',
      'Content optimization',
      'FAQ structuring',
      'Citation building',
    ],
    link: '/pricing',
    linkText: 'View Services',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    icon: TrendingUp,
    cardTitle: 'Track & Improve',
    cardDescription: 'Monitor your AI visibility scores over time and continuously refine your GEO strategy.',
    features: [
      'Monthly score tracking',
      'Competitor monitoring',
      'Performance reports',
      'Strategy refinement',
    ],
    link: '/contact',
    linkText: 'Get Started',
  },
]

export function ProcessStepper() {
  const [activeStep, setActiveStep] = useState(0)
  const currentStep = steps[activeStep]

  return (
    <section className="py-32 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-dream-purple-600 font-bold tracking-widest uppercase text-sm mb-4 block">
            Our Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dream-ink leading-tight">
            How We Optimize Your<br />
            <span className="text-gradient">AI Visibility</span>
          </h2>
          <p className="text-lg text-dream-ink-light max-w-2xl mx-auto">
            A proven methodology to get your brand recommended by AI assistants.
          </p>
        </div>

        {/* Process Stepper Container */}
        <div className="glass-card rounded-[2rem] p-8 md:p-12 lg:p-16 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side - Step Navigation */}
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 group ${
                    index === activeStep
                      ? 'bg-white/60'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <span
                    className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
                      index === activeStep
                        ? 'text-dream-ink'
                        : 'text-dream-ink/25 group-hover:text-dream-ink/45'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Side - Content Card */}
            <div className="relative">
              <div 
                key={currentStep.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-black/5 animate-fadeIn-card p-8"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-dream-purple-500 flex items-center justify-center mb-5 shadow-lg shadow-dream-purple-500/25">
                  <currentStep.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-dream-ink mb-3">
                  {currentStep.cardTitle}
                </h3>

                {/* Description */}
                <p className="text-dream-ink-light leading-relaxed mb-6">
                  {currentStep.cardDescription}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {currentStep.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-dream-ink-muted text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-dream-purple-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Link */}
                <Link
                  href={currentStep.link}
                  className="inline-flex items-center text-dream-purple-600 font-semibold hover:text-dream-purple-700 transition-colors group"
                >
                  {currentStep.linkText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Decorative dots */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeStep
                        ? 'bg-dream-purple-500 w-6'
                        : 'bg-dream-ink/20 hover:bg-dream-ink/40'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
