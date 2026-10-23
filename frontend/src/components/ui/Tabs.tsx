interface TabsProps {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === active}
          onClick={() => onChange(tab.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab.value === active ? "bg-primary text-white" : "bg-primary-soft text-heading hover:bg-primary/20"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}
