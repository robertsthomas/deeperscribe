'use client'

import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/lib/query-client"
import Link from "next/link"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <title>DeeperScribe Clinical Trials Matcher</title>
        <meta name="description" content="AI-powered clinical trial matching from patient transcripts" />
        <meta name="keywords" content="clinical trials, AI, healthcare, patient matching" />
      </Head>
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <header className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto w-full max-w-7xl h-full px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">DeeperScribe</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Clinical Trials</span>
                </Link>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
