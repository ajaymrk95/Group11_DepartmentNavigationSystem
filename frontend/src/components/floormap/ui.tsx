import { ChevronDown } from "lucide-react";

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
}

export function SectionHeader({ icon, label, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
      <span className="text-zinc-400">{icon}</span>
      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
      {count !== undefined && (
        <span className="ml-auto bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── SelectBox ────────────────────────────────────────────────────────────────

interface SelectBoxProps {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}

export function SelectBox({ value, onChange, children }: SelectBoxProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-zinc-200 text-zinc-700 text-xs font-medium
          rounded-lg pl-3 pr-8 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
    </div>
  );
}
