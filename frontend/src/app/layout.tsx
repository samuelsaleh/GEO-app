import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dwight - AI Search Visibility & Optimization',
  description: 'Ensure your brand is visible in ChatGPT, Bing Chat, and other AI answer engines',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-cream-200 text-ink-700">{children}</body>
    </html>
  )
}
