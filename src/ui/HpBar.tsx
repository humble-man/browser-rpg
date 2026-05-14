interface Props {
  label?: string;
  current: number;
  max: number;
  variant: 'hp' | 'mp' | 'xp';
  width?: number | string;
}

export function HpBar({ label, current, max, variant, width = '100%' }: Props) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="bar-wrap" style={{ width }}>
      {label && <span className="bar-label">{label}</span>}
      <div className={`bar bar-${variant}`}>
        <div className="bar-fill" style={{ width: `${pct}%` }} />
        <span className="bar-text">
          {current} / {max}
        </span>
      </div>
    </div>
  );
}
