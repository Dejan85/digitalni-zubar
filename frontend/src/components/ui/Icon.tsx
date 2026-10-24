interface IconProps {
  name: string; // naziv ligature iz Material Symbols (npr. "grid_view")
  size?: number; // piksela; bez njega veličinu određuje className (npr. text-[20px])
  className?: string;
}

// ikona iz Material Symbols fonta; dekorativna (aria-hidden), tekst uz nju nosi značenje
export function Icon({ name, size, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
