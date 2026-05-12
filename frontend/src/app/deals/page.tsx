import type { Metadata } from 'next'
import { DealsPage } from '@/components/deals-page'

export const metadata: Metadata = {
  title: "Dinesh's Dev Stack — Tools & Resources I Recommend",
  description: 'A curated list of tools, hosting, and services I personally use as a Tech Lead with 10+ years of experience. Exclusive discounts included.',
  openGraph: {
    title: "Dinesh's Dev Stack — Tools I Actually Use",
    description: 'Curated tools and resources from a Tech Lead with 10+ years of experience. Every tool here is something I personally pay for and recommend.',
    url: 'https://dineshstack.com/deals',
    siteName: 'DineshStack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dinesh's Dev Stack — Tools I Actually Use",
    description: 'Curated tools and resources from a Tech Lead with 10+ years of experience.',
    site: '@dineshstack',
    creator: '@dineshstack',
  },
  alternates: {
    canonical: 'https://dineshstack.com/deals',
  },
}

export default function Deals() {
  return <DealsPage />
}
