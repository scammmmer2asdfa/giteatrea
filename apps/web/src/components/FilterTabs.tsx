import { cn } from '@repolens/ui';

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

/** Segmented control for the open/closed/all filters on lists. */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-7 rounded-control border px-2.5 text-xs',
            value === option.value
              ? 'border-accent bg-accent/10 text-text-primary'
              : 'border-rule text-text-secondary hover:bg-surface-2',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
