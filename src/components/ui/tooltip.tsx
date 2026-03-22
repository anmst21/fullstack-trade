'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  side?: 'top' | 'bottom';
  delay?: number;
}

function isTouchDevice() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
}

export default function Tooltip({ content, children, align = 'center', side = 'bottom', delay = 500 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (isTouchDevice()) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setVisible(false);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) {
      setPos(null);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const left =
      align === 'left'
        ? rect.left
        : align === 'right'
          ? rect.right
          : rect.left + rect.width / 2;

    setPos({
      top: side === 'top' ? rect.top - 8 : rect.bottom + 8,
      left,
    });
  }, [visible, align, side]);

  const translateX =
    align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  const translateY = side === 'top' ? '-100%' : '0';

  // Arrow horizontal position
  const arrowPos =
    align === 'left'
      ? 'left-3'
      : align === 'right'
        ? 'right-3'
        : 'left-1/2 -translate-x-1/2';

  // Arrow vertical: top side → arrow at bottom, bottom side → arrow at top
  const arrowClasses = side === 'top'
    ? `absolute -bottom-[6px] ${arrowPos} w-[10px] h-[10px] rotate-45 bg-[var(--color-surface-modal)] border-r border-b border-white/10`
    : `absolute -top-[6px] ${arrowPos} w-[10px] h-[10px] rotate-45 bg-[var(--color-surface-modal)] border-l border-t border-white/10`;

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="inline-flex"
      >
        {children}
      </span>
      {visible && pos && createPortal(
        <div
          className="fixed z-[60] pointer-events-none w-max"
          style={{
            top: pos.top,
            left: pos.left,
            transform: `translate(${translateX}, ${translateY})`,
          }}
        >
          <div className="relative bg-[var(--color-surface-modal)] border border-white/10 rounded-lg shadow-xl px-3 py-2 text-[12px] text-[var(--text-primary)] font-medium w-max max-w-[260px] leading-relaxed">
            <div className={arrowClasses} />
            {content}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
