'use client';

import { usePathname } from 'next/navigation';
import TossTabs from '@/components/navigation/TossTabs';

const tabs = [
  { id: 'summary', label: '종합', icon: '📊', href: '/summary' },
  { id: 'analysis', label: '분석', icon: '📈', href: '/analysis' },
  { id: 'investment', label: '투자', icon: '💰', href: '/investment' },
  { id: 'sell-records', label: '매도', icon: '📋', href: '/sell-records' },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTab = tabs.find(tab => pathname?.includes(tab.id))?.id || 'summary';

  return (
    <div className="min-h-screen bg-gray-50">
      <TossTabs tabs={tabs} activeTab={activeTab} />
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}

