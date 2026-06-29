import type { LucideIcon } from 'lucide-react';

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type LandingStatsBarProps = {
  stats: StatItem[];
};

export function LandingStatsBar({ stats }: LandingStatsBarProps) {
  return (
    <section className="landing-stats-bar">
      <div className="landing-stats-bar__inner mx-auto grid min-w-0 w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="landing-stat-card group">
            <div className="landing-stat-card__icon">
              <Icon className="h-5 w-5" />
            </div>
            <p className="landing-stat-card__value">{value}</p>
            <p className="landing-stat-card__label">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
