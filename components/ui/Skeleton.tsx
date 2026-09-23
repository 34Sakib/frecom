/**
 * Skeletons are used in exactly one situation: where the answer genuinely is not
 * known yet. That is the cart, which cannot be read until localStorage resolves
 * (lib/store.ts hydrates deliberately, so the static export never renders a cart
 * it could not reproduce on the client). Every other loading surface on this site
 * is bound to real work — see Preloader.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-ink-700/70 ${className ?? ''}`}
    />
  );
}

/** A cart row held open at its final size, so nothing jumps when it resolves. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-5 border-t border-line py-6">
      <Skeleton className="h-[4.5rem] w-[4.5rem] rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
