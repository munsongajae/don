'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  href: string;
}

interface TossTabsProps {
  tabs: Tab[];
  activeTab: string;
}

export default function TossTabs({ tabs, activeTab }: TossTabsProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={clsx(
              'flex-1 px-4 py-4 text-center font-semibold transition-all duration-200',
              'relative min-w-[80px]',
              {
                'text-toss-blue-600': activeTab === tab.id,
                'text-gray-600': activeTab !== tab.id,
              }
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-toss-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

