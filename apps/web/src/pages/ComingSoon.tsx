import { Compass } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <Compass className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
      <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
      <p className="max-w-sm text-xs text-text-secondary">
        This view isn&apos;t built yet. It&apos;s on the roadmap — see CONTRIBUTING.md to help ship
        it.
      </p>
    </div>
  );
}
