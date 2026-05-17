import type { Metadata } from 'next'
import { PortfolioPage } from '@/components/portfolio-page'

export const metadata: Metadata = {
  title: 'Dinesh Wijethunga | Senior Full-Stack Developer — Dubai, UAE',
  description:
    'Senior Full-Stack Developer with 10+ years building scalable web applications. Specializing in Laravel, React, Next.js, and DevOps. Based in Dubai, UAE.',
  keywords: [
    'Senior Full-Stack Developer', 'Laravel Developer', 'React Developer', 'Next.js', 'TypeScript',
    'UAE Developer', 'Dubai Developer', 'DineshStack', 'Dinesh Wijethunga', 'Software Engineer',
  ],
  authors: [{ name: 'Dinesh Wijethunga', url: 'https://dineshstack.com' }],
  creator: 'Dinesh Wijethunga',
  openGraph: {
    type: 'profile',
    title: 'Dinesh Wijethunga | Senior Full-Stack Developer',
    description:
      '10+ years building scalable web applications. Laravel · React · Next.js · TypeScript. Based in Dubai, UAE.',
    url: 'https://dineshstack.com/portfolio',
    siteName: 'DineshStack',
    firstName: 'Dinesh',
    lastName: 'Wijethunga',
    images: [{ url: '/og-portfolio.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinesh Wijethunga | Senior Full-Stack Developer',
    description: '10+ years building scalable web apps. Laravel · React · Next.js · TypeScript. Dubai, UAE.',
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
    /* ProfilePage — triggers Google Knowledge Panel entity recognition */
    {
      '@type':    'ProfilePage',
      '@id':      'https://dineshstack.com/portfolio#profilepage',
      url:        'https://dineshstack.com/portfolio',
      name:       'Dinesh Wijethunga | Senior Full-Stack Developer',
      isPartOf:   { '@id': 'https://dineshstack.com/#website' },
      mainEntity: { '@id': 'https://dineshstack.com/#dinesh' },
      inLanguage: ['en', 'ar'],
    },
    {
      '@type':    'Person',
      '@id':      'https://dineshstack.com/#dinesh',
      name:       'Dinesh Wijethunga',
      url:        'https://dineshstack.com',
      email:      'hello@dineshwijethunga.me',
      jobTitle:   'Senior Full-Stack Developer',
      description: 'Senior Full-Stack Developer with 10+ years building scalable web applications. Specializing in Laravel, React, Next.js, and DevOps. Based in Dubai, UAE.',
      sameAs: [
        'https://github.com/dineshstack',
        'https://www.linkedin.com/in/dinesh-wijethunga',
        'https://twitter.com/dineshstack',
        'https://dineshstack.com',
      ],
      knowsAbout: ['Laravel', 'PHP', 'React', 'Next.js', 'TypeScript', 'MySQL', 'Docker', 'DevOps', 'VPS Management', 'AWS'],
      address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    },
    {
      '@type':    'WebSite',
      '@id':      'https://dineshstack.com/#website',
      url:        'https://dineshstack.com',
      name:       'DineshStack',
      inLanguage: ['en', 'ar'],
      author:     { '@id': 'https://dineshstack.com/#dinesh' },
    },
    {
      '@type':    'ProfessionalService',
      '@id':      'https://dineshstack.com/#consulting',
      name:       'DineshStack Consulting',
      provider:   { '@id': 'https://dineshstack.com/#dinesh' },
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
    /* SoftwareApplication schema per featured project */
    {
      '@type':               'SoftwareApplication',
      name:                  'DineshStack Referral System',
      url:                   'https://dineshstack.com/deals',
      author:                { '@id': 'https://dineshstack.com/#dinesh' },
      applicationCategory:   'BusinessApplication',
      operatingSystem:       'Web',
      description:           'Full-stack affiliate link management platform with real-time analytics, smart queue rotation, and multi-language EN/AR support.',
      programmingLanguage:   ['PHP', 'TypeScript'],
    },
    {
      '@type':               'SoftwareApplication',
      name:                  'DineshStack Blog',
      url:                   'https://dineshstack.com',
      author:                { '@id': 'https://dineshstack.com/#dinesh' },
      applicationCategory:   'WebApplication',
      operatingSystem:       'Web',
      description:           'Technical blog reaching 15K+ monthly readers covering Laravel, Next.js, DevOps, and software architecture.',
      programmingLanguage:   ['TypeScript'],
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
