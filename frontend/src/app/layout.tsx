import type { Metadata } from 'next'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'Miageru - AI Search Visibility & Optimization',
  description: 'Ensure your brand is visible in ChatGPT, Bing Chat, and other AI answer engines',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-cream-200 text-ink-700">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
