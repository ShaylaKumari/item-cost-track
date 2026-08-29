import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Period } from "@/types/domain";

export type PeriodPreset = "currentMonth" | "last30" | "last90" | "year";

const LABELS: Record<PeriodPreset, string> = {
  currentMonth: "Mês atual",
  last30: "Últimos 30 dias",
  last90: "Últimos 90 dias",
  year: "Ano atual",
};

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolvePeriod(preset: PeriodPreset): Period {
  const today = new Date();
  const to = iso(today);

  switch (preset) {
    case "currentMonth":
      return { from: `${to.slice(0, 7)}-01`, to };
    case "last30": {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from: iso(from), to };
    }
    case "last90": {
      const from = new Date(today);
      from.setDate(from.getDate() - 89);
      return { from: iso(from), to };
    }
    case "year":
      return { from: `${to.slice(0, 4)}-01-01`, to };
  }
}

export function PeriodSelect({
  value,
  onChange,
}: {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as PeriodPreset)}>
      <SelectTrigger className="w-[11rem]" aria-label="Período">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(LABELS) as PeriodPreset[]).map((preset) => (
          <SelectItem key={preset} value={preset}>
            {LABELS[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
