import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
}

export function DialogueBox({ title, children }: Props) {
  return (
    <div className="dialogue-box">
      {title && <div className="dialogue-title">{title}</div>}
      <div className="dialogue-body">{children}</div>
    </div>
  );
}
