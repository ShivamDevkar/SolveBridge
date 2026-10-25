import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxChars?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      value,
      maxLength,
      maxChars,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const limit = maxChars || maxLength;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-xs font-semibold text-slate-700 tracking-wide select-none"
            >
              {label}
              {props.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {limit && (
            <span className="text-[11px] text-slate-500 font-mono">
              {currentLength} / {limit}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={limit}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-lg p-3 text-sm border transition-colors duration-150 min-h-[96px] resize-y',
            'border-slate-300 focus:border-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
            'disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-600 focus-visible:ring-red-100',
            className
          )}
          {...props}
        />
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 flex items-center gap-1 font-medium mt-0.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
