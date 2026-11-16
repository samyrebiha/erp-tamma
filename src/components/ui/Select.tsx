import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      error,
      helperText,
      isRequired,
      placeholder = '— اختر من القائمة —',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-text-secondary">
            {label}
            {isRequired && <span className="text-status-danger mr-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full rounded-[8px] border border-border bg-white px-3.5 py-2 text-sm text-text-primary transition-colors appearance-none cursor-pointer',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'disabled:bg-page disabled:text-text-muted disabled:cursor-not-allowed',
            error && 'border-status-danger focus:border-status-danger focus:ring-status-danger',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-status-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

