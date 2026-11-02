import icon from "@/assets/lawma360-icon.png.asset.json";
import { cn } from "@/lib/utils";

export function LawmaMark({ className }: { className?: string }) {
  return <img src={icon.url} alt="LAWMA360" width={32} height={32} className={cn("size-8 shrink-0 object-contain", className)} />;
}
