import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefixElement,
      suffixElement,
      isRequired,
      id,
      dir,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
            {label}
            {isRequired && <span className="text-status-danger mr-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixElement && (
            <div className="absolute right-3 flex items-center pointer-events-none text-text-muted text-sm">
              {prefixElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            dir={dir}
            className={cn(
              'w-full rounded-[8px] border border-border bg-white px-3.5 py-2 text-sm text-text-primary transition-colors',
              'placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              'disabled:bg-page disabled:text-text-muted disabled:cursor-not-allowed',
              prefixElement ? 'pr-9' : '',
              suffixElement ? 'pl-12' : '',
              error && 'border-status-danger focus:border-status-danger focus:ring-status-danger',
              className
            )}
            {...props}
          />
          {suffixElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-muted text-xs font-medium">
              {suffixElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

