'use client'

import { useState } from 'react'
import { ArrowRight, Search, Target, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  icon: React.ElementType
  image: string
  cardTitle: string
  cardDescription: string
  link: string
  linkText: string
  accentColor: string
}

const steps: Step[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    cardTitle: 'AI Visibility Analysis',
    cardDescription: 'We analyze how major AI engines perceive your brand and compare your visibility against key competitors.',
    link: '/tools/ai-visibility',
    linkText: 'Try Free Tool',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'planning',
    title: 'Planning',
    icon: Target,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    cardTitle: 'Tailored Strategy',
    cardDescription: 'Crafting a customized optimization strategy tailored to your brand\'s unique position and goals.',
    link: '/contact',
    linkText: 'Learn more',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'execution',
    title: 'Execution',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    cardTitle: 'Implementation',
    cardDescription: 'We optimize your content structure, schema markup, and citations to maximize AI discoverability.',
    link: '/pricing',
    linkText: 'View services',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    cardTitle: 'Track & Improve',
    cardDescription: 'Monitor your AI visibility scores over time and continuously refine your GEO strategy.',
    link: '/tools',
    linkText: 'Explore tools',
    accentColor: 'bg-emerald-500',
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
          <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 block">
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
                  className={`w-full text-left py-4 px-2 rounded-xl transition-all duration-300 group ${
                    index === activeStep
                      ? 'bg-white/50'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <span
                    className={`text-2xl md:text-3xl font-semibold transition-all duration-300 ${
                      index === activeStep
                        ? 'text-dream-ink'
                        : 'text-dream-ink/30 group-hover:text-dream-ink/50'
                    }`}
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
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
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-black/5 animate-fadeIn"
              >
                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={currentStep.image}
                    alt={currentStep.cardTitle}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${currentStep.accentColor} flex items-center justify-center mb-4 shadow-lg`}>
                    <currentStep.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-dream-ink mb-3">
                    {currentStep.cardTitle}
                  </h3>

                  {/* Description */}
                  <p className="text-dream-ink-light leading-relaxed mb-6">
                    {currentStep.cardDescription}
                  </p>

                  {/* Link */}
                  <Link
                    href={currentStep.link}
                    className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors group"
                  >
                    {currentStep.linkText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Decorative dots */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeStep
                        ? 'bg-emerald-500 w-6'
                        : 'bg-dream-ink/20 hover:bg-dream-ink/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  )
}

