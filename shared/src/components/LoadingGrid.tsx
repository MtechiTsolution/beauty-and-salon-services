export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
