import SymbolIcon from "./SymbolIcon";
import { ink, tint } from "@/lib/profile";
import type { PersonalityType } from "@/lib/types";

const SIZES = {
  sm: { box: "h-12 w-12", icon: "h-7 w-7" },
  md: { box: "h-20 w-20", icon: "h-12 w-12" },
  lg: { box: "h-32 w-32", icon: "h-20 w-20" },
};

/** 대표 색 원 안에 상징 아이콘 */
export default function TypeEmblem({ type, size = "md" }: { type: PersonalityType; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div
      className={`${s.box} flex shrink-0 items-center justify-center rounded-full`}
      style={{ backgroundColor: tint(type.color, 0.16), color: ink(type.color), boxShadow: `inset 0 0 0 2px ${tint(type.color, 0.35)}` }}
    >
      <SymbolIcon symbol={type.symbol} className={s.icon} label={type.symbolLabel} />
    </div>
  );
}
