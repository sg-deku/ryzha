import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { CommandPalette } from "@/components/ui/command-palette"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rhyza – Financial Brain for Startups",
  description: "AI‑powered financial management"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <CommandPalette />
        </Providers>
      </body>
    </html>
  )
}
