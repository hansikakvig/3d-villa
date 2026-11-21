"use client";

import { Html } from "@react-three/drei";
import { Vec3 } from "./data";

interface Props {
  position: Vec3;
  label: string;
  active?: boolean;
  small?: boolean;
  onClick: () => void;
  onHover?: (h: boolean) => void;
}

export default function LocationHotspot({ position, label, active, small, onClick, onHover }: Props) {
  return (
    <Html position={position} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        className={`tb-hotspot group pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border px-1.5 py-1.5 pr-3.5 text-[11px] tracking-[0.14em] uppercase backdrop-blur-md transition-all duration-300 ${
          active
            ? "border-[#f3d9a4]/80 bg-[#f3d9a4]/90 text-[#1f2a1d]"
            : "border-white/30 bg-[#13201a]/55 text-white hover:border-[#f3d9a4]/70 hover:bg-[#13201a]/75"
        } ${small ? "text-[10px]" : ""}`}
        aria-label={`Go to ${label}`}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className={`absolute h-4 w-4 rounded-full ${active ? "bg-[#1f2a1d]/20" : "bg-[#f3d9a4]/30"} tb-pulse`} />
          <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#1f2a1d]" : "bg-[#f3d9a4]"}`} />
        </span>
        {label}
      </button>
    </Html>
  );
}
