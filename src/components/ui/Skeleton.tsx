import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-[linear-gradient(90deg,#f1eee5_25%,#e8e4d9_37%,#f1eee5_63%)]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
