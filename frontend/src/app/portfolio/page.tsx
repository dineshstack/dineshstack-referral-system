import type { Metadata } from 'next'
import { PortfolioPage } from '@/components/portfolio-page'

export const metadata: Metadata = {
  title: 'Dinesh | Tech Lead & Full-Stack Developer — UAE',
  description:
    'Tech Lead and Full-Stack Developer with 10+ years building production systems. Specializing in Laravel, Next.js, and scalable web architecture. Based in UAE.',
  keywords: [
    'Tech Lead', 'Full-Stack Developer', 'Laravel', 'Next.js', 'TypeScript',
    'UAE Developer', 'DineshStack', 'Web Architecture', 'Software Engineer',
  ],
  authors: [{ name: 'Dinesh', url: 'https://dineshstack.com' }],
  creator: 'Dinesh',
  openGraph: {
    type: 'profile',
    title: 'Dinesh | Tech Lead & Full-Stack Developer',
    description:
      '10+ years building production systems. Laravel · Next.js · TypeScript. Based in UAE.',
    url: 'https://dineshstack.com/portfolio',
    siteName: 'DineshStack',
    firstName: 'Dinesh',
    images: [{ url: '/og-portfolio.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinesh | Tech Lead & Full-Stack Developer',
    description: '10+ years building production systems. Laravel · Next.js · TypeScript. UAE.',
    creator: '@dineshstack',
  },
  alternates: {
    canonical: 'https://dineshstack.com/portfolio',
    languages: { ar: 'https://dineshstack.com/portfolio?lang=ar' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id':   'https://dineshstack.com/#dinesh',
      name:    'Dinesh',
      url:     'https://dineshstack.com',
      email:   'info@dineshstack.com',
      jobTitle: 'Tech Lead',
      description: 'Tech Lead and Full-Stack Developer with 10+ years building production-grade systems. Specializing in Laravel, Next.js, and scalable web architecture.',
      sameAs: [
        'https://github.com/dineshstack',
        'https://linkedin.com/in/dineshstack',
        'https://twitter.com/dineshstack',
        'https://dineshstack.com',
      ],
      worksFor: { '@type': 'Organization', name: 'Kief Studio' },
      knowsAbout: ['Laravel', 'Next.js', 'TypeScript', 'MySQL', 'Docker', 'System Architecture'],
      address: { '@type': 'PostalAddress', addressCountry: 'AE' },
    },
    {
      '@type': 'WebSite',
      '@id':   'https://dineshstack.com/#website',
      url:     'https://dineshstack.com',
      name:    'DineshStack',
      inLanguage: ['en', 'ar'],
      author:  { '@id': 'https://dineshstack.com/#dinesh' },
    },
    {
      '@type': 'ProfessionalService',
      '@id':   'https://dineshstack.com/#consulting',
      name:    'DineshStack Consulting',
      provider: { '@id': 'https://dineshstack.com/#dinesh' },
      areaServed: { '@type': 'Country', name: 'AE' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Consulting Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Laravel Architecture & Development' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Next.js Application Development' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Technical Team Leadership' } },
        ],
      },
    },
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioPage />
    </>
  )
}
