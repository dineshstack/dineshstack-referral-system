import type { Metadata } from 'next'
import { DealsPage } from '@/components/deals-page'

export const metadata: Metadata = {
  title: 'Deals & Resources | DineshStack',
  description: 'Handpicked tools, hosting, and services I personally use and recommend — with exclusive discounts.',
}

export default function Deals() {
  return <DealsPage />
}
