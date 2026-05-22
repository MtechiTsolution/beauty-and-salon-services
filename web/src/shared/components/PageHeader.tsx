import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
};

export function PageHeader({ title, description, actionLabel, onAction, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action ?? (actionLabel && onAction ? (
        <Button
          onClick={onAction}
          className="h-8 min-h-8 w-auto max-w-full flex-row items-center gap-2 self-start rounded-full px-6 py-0 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="leading-none">{actionLabel}</span>
        </Button>
      ) : null)}
    </div>
  );
}
