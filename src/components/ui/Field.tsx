import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  leadingIcon?: ReactNode;
  containerClassName?: string;
};

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & {
    inputClassName?: string;
  };

export function Input({
  label,
  hint,
  error,
  optional,
  leadingIcon,
  containerClassName,
  inputClassName,
  type = 'text',
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = props.name ? `${props.name}-${generatedId}` : generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;
  const describedBy = error || hint ? `${id}-help` : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      <div className="mb-1 sm:mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.75rem] font-semibold text-ink-800 sm:text-[0.8125rem]">
          {label}
          {optional ? (
            <span className="ml-1.5 font-medium text-ink-400">Optional</span>
          ) : null}
        </label>
      </div>
      <div className="relative">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-xl border bg-white px-3 text-[0.8125rem] text-ink-950 shadow-[inset_0_1px_2px_rgba(12,23,18,0.03)] transition-colors sm:h-12 sm:px-3.5 sm:text-[0.9375rem]',
            'border-ink-950/12 hover:border-ink-950/20',
            'focus:border-bamboo-500 focus:outline-none focus:ring-4 focus:ring-bamboo-500/10',
            'disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-ink-400',
            leadingIcon ? 'pl-10' : undefined,
            isPassword && 'pr-12',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
            inputClassName,
          )}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-950/5 hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-bamboo-500"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-help`} className="mt-1 sm:mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-help`} className="mt-1 sm:mt-1.5 text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'id'> & {
    inputClassName?: string;
    counter?: boolean;
  };

export function Textarea({
  label,
  hint,
  error,
  optional,
  containerClassName,
  inputClassName,
  counter = false,
  maxLength,
  value,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = props.name ? `${props.name}-${generatedId}` : generatedId;
  const describedBy = error || hint ? `${id}-help` : undefined;
  const length = typeof value === 'string' ? value.length : 0;

  return (
    <div className={cn('w-full', containerClassName)}>
      <div className="mb-1 sm:mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.75rem] font-semibold text-ink-800 sm:text-[0.8125rem]">
          {label}
          {optional ? (
            <span className="ml-1.5 font-medium text-ink-400">Optional</span>
          ) : null}
        </label>
        {counter && maxLength ? (
          <span className={cn('text-[0.6875rem] tabular', length > maxLength - 25 ? 'text-amber-600' : 'text-ink-400')}>
            {length}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        id={id}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-[5.5rem] sm:min-h-28 w-full resize-y rounded-xl border border-ink-950/12 bg-white px-3 py-2.5 text-[0.8125rem] leading-relaxed text-ink-950 shadow-[inset_0_1px_2px_rgba(12,23,18,0.03)] transition-colors sm:px-3.5 sm:py-3 sm:text-[0.9375rem]',
          'hover:border-ink-950/20 focus:border-bamboo-500 focus:outline-none focus:ring-4 focus:ring-bamboo-500/10',
          'disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-ink-400',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
          inputClassName,
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type SelectProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | Array<{ value: string; label: string }>;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

export function Select({
  label,
  hint,
  error,
  optional,
  containerClassName,
  value,
  onChange,
  options,
  name,
  required,
  disabled,
}: SelectProps) {
  const generatedId = useId();
  const id = name ? `${name}-${generatedId}` : generatedId;
  return (
    <div className={cn('w-full', containerClassName)}>
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-800">
        {label}
        {optional ? <span className="ml-1.5 font-medium text-ink-400">Optional</span> : null}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        className={cn(
          'h-10 sm:h-12 w-full appearance-none rounded-xl border border-ink-950/12 bg-white bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%2364746b%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27/%3E%3C/svg%3E")] bg-[length:16px_16px] bg-[right_0.875rem_center] bg-no-repeat px-3 pr-10 text-[0.8125rem] text-ink-950 transition-colors sm:px-3.5 sm:text-[0.9375rem]',
          'hover:border-ink-950/20 focus:border-bamboo-500 focus:outline-none focus:ring-4 focus:ring-bamboo-500/10',
          !value && 'text-ink-400',
          error && 'border-red-300',
        )}
      >
        <option value="">Select one</option>
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
      {error ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
