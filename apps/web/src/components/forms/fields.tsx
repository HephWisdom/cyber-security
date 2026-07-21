import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type Common = { label: string; error?: FieldError; hint?: string; required?: boolean };

export function TextField({
  label,
  error,
  hint,
  required,
  type = 'text',
  registration,
  autoComplete,
  placeholder,
}: Common & {
  type?: string;
  registration: UseFormRegisterReturn;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = registration.name;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-cyan-300" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        className="field"
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...registration}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  required,
  registration,
  rows = 6,
  placeholder,
}: Common & { registration: UseFormRegisterReturn; rows?: number; placeholder?: string }) {
  const id = registration.name;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-cyan-300" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <textarea
        className="field resize-y"
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...registration}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  required,
  registration,
  options,
}: Common & { registration: UseFormRegisterReturn; options: Array<[string, string]> }) {
  const id = registration.name;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-cyan-300" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        className="field"
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
      >
        <option value="">Select an option</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function ConsentField({
  label,
  error,
  registration,
}: {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}) {
  const id = registration.name;
  return (
    <div>
      <label
        className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-300"
        htmlFor={id}
      >
        <input
          className="mt-1 h-4 w-4 shrink-0 accent-cyan-300"
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          {...registration}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div className="absolute -left-[10000px]" aria-hidden="true">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  );
}
