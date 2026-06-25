import { useTheme } from '@mit-salon/shared/components/ThemeProvider';
import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  variant?: 'compact' | 'segmented';
  className?: string;
};

export function ThemeToggle({ variant = 'segmented', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === 'compact') {
    const isDark = theme === 'dark';
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  const fullWidth = Boolean(className?.includes('w-full'));

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/40 p-1',
        fullWidth ? 'flex w-full' : 'inline-flex',
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          fullWidth && 'flex-1 justify-center',
          theme === 'light'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Sun className="h-4 w-4 shrink-0" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          fullWidth && 'flex-1 justify-center',
          theme === 'dark'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Moon className="h-4 w-4 shrink-0" />
        Dark
      </button>
    </div>
  );
}
