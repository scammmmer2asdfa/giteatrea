import { Spinner } from '@repolens/ui';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-text-secondary">
      <Spinner className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
