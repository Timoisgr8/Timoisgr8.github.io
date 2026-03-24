export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="skeleton h-4 w-2/5" />
      <div className="skeleton h-3 w-11/12" />
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-3 w-2/5 mt-2" />
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 6 }: SkeletonGridProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
