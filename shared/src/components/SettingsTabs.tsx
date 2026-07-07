import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type SettingsTabItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

type SettingsTabsProps = {
  tabs: SettingsTabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  id?: string;
};

export function SettingsTabs({ tabs, value, onChange, className, id = 'settings-tabs' }: SettingsTabsProps) {
  return (
    <div
      className={cn('settings-tabs', className)}
      role="tablist"
      aria-label="Settings sections"
      id={id}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-${tab.id}`}
            aria-selected={active}
            aria-controls={`${id}-panel-${tab.id}`}
            className={cn('settings-tabs__btn', active && 'settings-tabs__btn--active')}
            onClick={() => onChange(tab.id)}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type SettingsTabPanelProps = {
  tabId: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
  tabsId?: string;
};

export function SettingsTabPanel({
  tabId,
  activeTab,
  children,
  className,
  tabsId = 'settings-tabs',
}: SettingsTabPanelProps) {
  if (activeTab !== tabId) return null;

  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${tabId}`}
      aria-labelledby={`${tabsId}-${tabId}`}
      className={cn('settings-tab-panel', className)}
    >
      {children}
    </div>
  );
}
