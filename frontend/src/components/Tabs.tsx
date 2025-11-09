import { ReactNode, useState } from 'react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const Tabs = ({ tabs, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx('tab', activeTab === tab.id && 'active')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{activeContent}</div>
    </div>
  );
};

