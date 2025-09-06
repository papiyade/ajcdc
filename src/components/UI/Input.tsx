import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = clsx(
    'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
    'focus:border-primary focus:ring-primary focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    error && 'border-redaj focus:border-redaj focus:ring-redaj',
    icon && iconPosition === 'left' && 'pl-10',
    icon && iconPosition === 'right' && 'pr-10',
    className
  );

  return (
    <div className={clsx('space-y-1', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-redaj ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 w-5 h-5">
              {icon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 w-5 h-5">
              {icon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-redaj" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function Textarea({
  label,
  error,
  helperText,
  fullWidth = false,
  resize = 'vertical',
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const textareaClasses = clsx(
    'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
    'focus:border-primary focus:ring-primary focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    error && 'border-redaj focus:border-redaj focus:ring-redaj',
    resize === 'none' && 'resize-none',
    resize === 'vertical' && 'resize-y',
    resize === 'horizontal' && 'resize-x',
    resize === 'both' && 'resize',
    className
  );

  return (
    <div className={clsx('space-y-1', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-redaj ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-redaj" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string; disabled?: boolean }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  fullWidth = false,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const selectClasses = clsx(
    'block w-full rounded-lg border-gray-300 shadow-sm transition-colors duration-200',
    'focus:border-primary focus:ring-primary focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    error && 'border-redaj focus:border-redaj focus:ring-redaj',
    className
  );

  return (
    <div className={clsx('space-y-1', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-redaj ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-redaj" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export function Checkbox({
  label,
  description,
  error,
  className,
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={clsx(
              'w-4 h-4 text-primary border-gray-300 rounded',
              'focus:ring-primary focus:ring-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-redaj',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={checkboxId} className="font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-redaj ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

