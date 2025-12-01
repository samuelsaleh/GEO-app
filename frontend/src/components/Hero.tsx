'use client'

import { useState } from 'react'
import { ArrowRight, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()
  const [brandName, setBrandName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandName || !websiteUrl) return
    
    setIsLoading(true)
    // Navigate to the full tool with pre-filled values
    const params = new URLSearchParams({
      brand: brandName,
      url: websiteUrl
    })
    router.push(`/tools/ai-visibility?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden font-display">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      />

      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center relative z-10">
        
        {/* Hero Text Content */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-[#202128] text-4xl sm:text-5xl md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em] mb-5">
            Optimize for the <br className="hidden sm:block" />
            AI Era
          </h1>
          
          <p className="text-[#202128]/60 text-base md:text-lg font-medium leading-[1.5] tracking-[-0.01em] max-w-xl">
            See how ChatGPT, Perplexity, and Gemini see your brand. Get your visibility score in seconds.
          </p>
        </div>

        {/* Compact Form Card */}
        <div className="w-full max-w-[600px] animate-enter delay-200">
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 p-6 md:p-8 border border-white/50">
            <div className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#202128]/60 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Nike, HubSpot"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[#202128] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#202128]/20 focus:border-[#202128]/30 transition-all"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#202128]/60 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="e.g., nike.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[#202128] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#202128]/20 focus:border-[#202128]/30 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!brandName || !websiteUrl || isLoading}
                className="w-full bg-[#202128] text-white h-[52px] px-6 rounded-xl flex items-center justify-center gap-2 font-semibold text-base hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get Your Score
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Trust Text */}
            <p className="text-center text-xs text-[#202128]/40 mt-4">
              Free • No credit card required • Results in 60 seconds
            </p>
          </form>
        </div>

      </div>
    </section>
  )
}
