/**
 * FormField — Production-ready form input component.
 * @PRISM owns this file. @MOSAIC reviews design system compliance.
 *
 * Supports 8 field types composing native HTML inputs styled with Tailwind/Untitled UI tokens.
 * Validation inline, accessible (aria-invalid, aria-describedby), keyboard navigable.
 */

import { useState, useCallback, useId } from 'react';
import type { ReactNode, ChangeEvent } from 'react';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email';
  value?: unknown;
  message?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldProps {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  defaultValue?: unknown;
  disabled?: boolean;
  helpText?: string;
  errorMessage?: string;
  onChange: (value: unknown) => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_FR_REGEX = /^(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

function runValidation(
  value: unknown,
  rules: ValidationRule[],
  required?: boolean,
): string | null {
  const strValue = value == null ? '' : String(value);

  if (required && strValue.trim() === '') {
    const reqRule = rules.find((r) => r.type === 'required');
    return reqRule?.message ?? 'Ce champ est requis';
  }

  if (strValue.trim() === '') return null;

  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (strValue.trim() === '') return rule.message ?? 'Ce champ est requis';
        break;
      case 'email':
        if (!EMAIL_REGEX.test(strValue)) return rule.message ?? 'Email invalide';
        break;
      case 'min':
        if (typeof rule.value === 'number' && Number(strValue) < rule.value) {
          return rule.message ?? `Minimum: ${String(rule.value)}`;
        }
        break;
      case 'max':
        if (typeof rule.value === 'number' && Number(strValue) > rule.value) {
          return rule.message ?? `Maximum: ${String(rule.value)}`;
        }
        break;
      case 'pattern':
        if (rule.value instanceof RegExp && !rule.value.test(strValue)) {
          return rule.message ?? 'Format invalide';
        }
        break;
    }
  }

  return null;
}

const baseInputClasses = [
  'w-full rounded-lg border bg-bg-primary px-3.5 py-2.5 text-sm text-text-primary',
  'placeholder:text-text-placeholder',
  'border-border-primary',
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-secondary',
  'transition duration-100 ease-linear',
].join(' ');

const errorInputClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500';

export function FormField(props: FormFieldProps): ReactNode {
  const {
    id,
    type,
    label,
    placeholder,
    required,
    validation = [],
    options = [],
    defaultValue,
    disabled,
    helpText,
    errorMessage: externalError,
    onChange,
  } = props;

  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const autoId = useId();
  const fieldId = id || autoId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const displayError = externalError ?? (touched ? internalError : null);
  const isInvalid = Boolean(displayError);

  const handleBlur = useCallback(
    (value: unknown) => {
      setTouched(true);
      const builtInRules = [...validation];

      if (type === 'email' && !builtInRules.some((r) => r.type === 'email')) {
        builtInRules.push({ type: 'email', message: 'Email invalide' });
      }
      if (type === 'phone' && !builtInRules.some((r) => r.type === 'pattern')) {
        builtInRules.push({
          type: 'pattern',
          value: PHONE_FR_REGEX,
          message: 'Numero de telephone invalide',
        });
      }

      const error = runValidation(value, builtInRules, required);
      setInternalError(error);
    },
    [validation, required, type],
  );

  const handleChange = useCallback(
    (value: unknown) => {
      onChange(value);
      if (touched) {
        const builtInRules = [...validation];
        if (type === 'email') builtInRules.push({ type: 'email' });
        if (type === 'phone') builtInRules.push({ type: 'pattern', value: PHONE_FR_REGEX });
        const error = runValidation(value, builtInRules, required);
        setInternalError(error);
      }
    },
    [onChange, touched, validation, required, type],
  );

  const ariaDescribedBy = [
    displayError ? errorId : null,
    helpText ? helpId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputClasses = `${baseInputClasses} ${isInvalid ? errorInputClasses : ''}`;

  const renderField = (): ReactNode => {
    const commonProps = {
      id: fieldId,
      disabled,
      'aria-invalid': isInvalid || undefined,
      'aria-describedby': ariaDescribedBy,
      'aria-required': required || undefined,
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            {...commonProps}
            type={type === 'phone' ? 'tel' : type}
            className={inputClasses}
            placeholder={placeholder}
            defaultValue={defaultValue as string | undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            className={inputClasses}
            placeholder={placeholder}
            defaultValue={defaultValue as number | undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(Number(e.target.value))}
            onBlur={(e) => handleBlur(Number(e.target.value))}
          />
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            className={inputClasses}
            defaultValue={defaultValue as string | undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            className={inputClasses}
            defaultValue={defaultValue as string | undefined}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              {...commonProps}
              type="checkbox"
              className="h-4 w-4 rounded border-border-primary text-brand-500 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              defaultChecked={Boolean(defaultValue)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.checked)}
              onBlur={(e) => handleBlur(e.target.checked)}
            />
            {helpText && (
              <span id={helpId} className="text-sm text-text-tertiary">
                {helpText}
              </span>
            )}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className={`${inputClasses} min-h-[80px] resize-y`}
            placeholder={placeholder}
            defaultValue={defaultValue as string | undefined}
            rows={3}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
            onBlur={(e) => handleBlur(e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div data-component="FormField" data-id={fieldId} className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-text-secondary"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {renderField()}

      {displayError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}

      {helpText && type !== 'checkbox' && !displayError && (
        <p id={helpId} className="text-sm text-text-tertiary">
          {helpText}
        </p>
      )}
    </div>
  );
}
