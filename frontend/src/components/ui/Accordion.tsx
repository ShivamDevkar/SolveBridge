import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenId,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const baseId = useId();

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextBtn = document.getElementById(`${baseId}-btn-${(index + 1) % items.length}`);
      nextBtn?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevBtn = document.getElementById(`${baseId}-btn-${(index - 1 + items.length) % items.length}`);
      prevBtn?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstBtn = document.getElementById(`${baseId}-btn-0`);
      firstBtn?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastBtn = document.getElementById(`${baseId}-btn-${items.length - 1}`);
      lastBtn?.focus();
    }
  };

  return (
    <div className={clsx('space-y-3', className)} role="presentation">
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const buttonId = `${baseId}-btn-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={item.id}
            className={clsx(
              'border rounded-xl transition-colors duration-150 overflow-hidden bg-white',
              isOpen
                ? 'border-blue-300 shadow-sm'
                : 'border-slate-200/90 hover:border-slate-300'
            )}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={clsx(
                  'w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2',
                  isOpen ? 'bg-blue-50/40 text-blue-900' : 'hover:bg-slate-50/80'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon && (
                    <span className="text-blue-600 shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={clsx(
                    'w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200',
                    isOpen && 'transform rotate-180 text-blue-600'
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={clsx(
                'grid transition-all duration-200 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="p-4 sm:p-5 pt-0 sm:pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
