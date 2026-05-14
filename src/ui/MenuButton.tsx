import type { ReactNode } from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  fullWidth?: boolean;
}

export function MenuButton({ onClick, disabled, variant = 'primary', children, fullWidth }: Props) {
  return (
    <button
      className={`btn btn-${variant}${fullWidth ? ' btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
