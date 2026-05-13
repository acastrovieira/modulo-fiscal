import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "attention" | "critical" | "success";

const toneClasses: Record<Tone, string> = {
  neutral: "border-slate-300 bg-white text-slate-700",
  attention: "border-amber-300 bg-amber-50 text-amber-800",
  critical: "border-red-300 bg-red-50 text-red-700",
  success: "border-emerald-300 bg-emerald-50 text-emerald-700"
};

export function StatusBadge({ tone, children }: Readonly<{ tone: Tone; children: React.ReactNode }>) {
  return (
    <Badge variant="outline" className={toneClasses[tone]}>
      {children}
    </Badge>
  );
}
