/**
 * FormField -- Production-ready form input component.
 * @PRISM owns this file. @MOSAIC reviews design system compliance.
 *
 * Composes React Aria primitives with Untitled UI design token classes.
 * Supports 8 field types: text, number, date, select, checkbox, textarea, email, phone.
 * Validation inline, accessible (aria-invalid, aria-describedby), keyboard navigable.
 */

import { useState, useCallback, useId } from 'react';
import type { ReactNode, ChangeEvent } from 'react';
import {
  Input as AriaInput,
  TextArea as AriaTextArea,
  Label as AriaLabel,
  Text as AriaText,
  Checkbox as AriaCheckbox,
  Group as AriaGroup,
} from 'react-aria-components';
import { extendTailwindMerge } from 'tailwind-merge';

/* ------------------------------------------------------------------ */
/*  cx — Tailwind class merger (inline, no cross-package import)      */
/* ------------------------------------------------------------------ */

const cx = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-xs',
        'display-sm',
        'display-md',
        'display-lg',
        'display-xl',
        'display-2xl',
      ],
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Public types (exported interface is identical to the original)     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_FR_REGEX = /^(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

function buildRules(
  validation: ValidationRule[],
  type: FormFieldProps['type'],
): ValidationRule[] {
  const rules = [...validation];

  if (type === 'email' && !rules.some((r) => r.type === 'email')) {
    rules.push({ type: 'email', message: 'Email invalide' });
  }
  if (type === 'phone' && !rules.some((r) => r.type === 'pattern')) {
    rules.push({
      type: 'pattern',
      value: PHONE_FR_REGEX,
      message: 'Numero de telephone invalide',
    });
  }

  return rules;
}

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

/* ------------------------------------------------------------------ */
/*  Untitled UI token class constants                                  */
/* ------------------------------------------------------------------ */

/** Wrapper ring + bg + shadow that mirrors InputBase from Untitled UI */
const inputWrapperBase = [
  'group/input relative flex w-full flex-row items-center rounded-lg',
  'bg-primary shadow-xs ring-1 ring-primary ring-inset',
  'transition-shadow duration-100 ease-linear',
].join(' ');

/** Inner <input> / <textarea> text and placeholder tokens */
const inputTextBase = [
  'm-0 w-full bg-transparent text-primary ring-0 outline-hidden',
  'placeholder:text-placeholder',
  'autofill:rounded-lg autofill:text-primary',
  'disabled:cursor-not-allowed',
  'px-3.5 py-2.5 text-md',
].join(' ');

/** Checkmark SVG path data (Untitled UI pattern) */
const CHECKMARK_PATH = 'M11.6666 3.5L5.24992 9.91667L2.33325 7';

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FieldLabel({
  htmlFor,
  required,
  isInvalid,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  isInvalid?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <AriaLabel
      htmlFor={htmlFor}
      className="flex cursor-default items-center gap-0.5 text-sm font-medium text-secondary"
    >
      {children}
      {required && (
        <span className={cx('text-brand-tertiary', isInvalid && 'text-error-primary')}>
          *
        </span>
      )}
    </AriaLabel>
  );
}

function HintText({
  id,
  isInvalid,
  children,
}: {
  id: string;
  isInvalid?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <AriaText
      id={id}
      slot={isInvalid ? 'errorMessage' : 'description'}
      className={cx('text-sm text-tertiary', isInvalid && 'text-error-primary')}
      {...(isInvalid ? { role: 'alert' } : {})}
    >
      {children}
    </AriaText>
  );
}

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

function TextInputField({
  fieldId,
  inputType,
  placeholder,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  inputType: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  onChangeValue: (v: string) => void;
  onBlurValue: (v: string) => void;
}): ReactNode {
  return (
    <AriaGroup
      isDisabled={disabled}
      isInvalid={isInvalid}
      className={({ isFocusWithin, isDisabled, isInvalid: inv }) =>
        cx(
          inputWrapperBase,
          isFocusWithin && !isDisabled && 'ring-2 ring-brand',
          isDisabled && 'cursor-not-allowed opacity-50',
          inv && 'ring-error_subtle',
          inv && isFocusWithin && 'ring-2 ring-error',
        )
      }
    >
      <AriaInput
        id={fieldId}
        type={inputType}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={undefined}
        className={inputTextBase}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value)}
        onBlur={(e) => onBlurValue((e.target as HTMLInputElement).value)}
      />
    </AriaGroup>
  );
}

function NumberInputField({
  fieldId,
  placeholder,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  placeholder?: string;
  defaultValue?: number;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  onChangeValue: (v: number) => void;
  onBlurValue: (v: number) => void;
}): ReactNode {
  return (
    <AriaGroup
      isDisabled={disabled}
      isInvalid={isInvalid}
      className={({ isFocusWithin, isDisabled, isInvalid: inv }) =>
        cx(
          inputWrapperBase,
          isFocusWithin && !isDisabled && 'ring-2 ring-brand',
          isDisabled && 'cursor-not-allowed opacity-50',
          inv && 'ring-error_subtle',
          inv && isFocusWithin && 'ring-2 ring-error',
        )
      }
    >
      <AriaInput
        id={fieldId}
        type="number"
        placeholder={placeholder}
        defaultValue={defaultValue != null ? String(defaultValue) : undefined}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={inputTextBase}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeValue(Number(e.target.value))}
        onBlur={(e) => onBlurValue(Number((e.target as HTMLInputElement).value))}
      />
    </AriaGroup>
  );
}

function DateInputField({
  fieldId,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  defaultValue?: string;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  onChangeValue: (v: string) => void;
  onBlurValue: (v: string) => void;
}): ReactNode {
  return (
    <AriaGroup
      isDisabled={disabled}
      isInvalid={isInvalid}
      className={({ isFocusWithin, isDisabled, isInvalid: inv }) =>
        cx(
          inputWrapperBase,
          isFocusWithin && !isDisabled && 'ring-2 ring-brand',
          isDisabled && 'cursor-not-allowed opacity-50',
          inv && 'ring-error_subtle',
          inv && isFocusWithin && 'ring-2 ring-error',
        )
      }
    >
      <AriaInput
        id={fieldId}
        type="date"
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={inputTextBase}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value)}
        onBlur={(e) => onBlurValue((e.target as HTMLInputElement).value)}
      />
    </AriaGroup>
  );
}

function SelectField({
  fieldId,
  placeholder,
  options,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  placeholder?: string;
  options: SelectOption[];
  defaultValue?: string;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  onChangeValue: (v: string) => void;
  onBlurValue: (v: string) => void;
}): ReactNode {
  /* Native <select> wrapped in Untitled UI Group styling.
     We use a native select here because React Aria's <Select> requires
     ListBox/Popover which would be a heavy dependency for FormField. */
  return (
    <AriaGroup
      isDisabled={disabled}
      isInvalid={isInvalid}
      className={({ isFocusWithin, isDisabled, isInvalid: inv }) =>
        cx(
          inputWrapperBase,
          isFocusWithin && !isDisabled && 'ring-2 ring-brand',
          isDisabled && 'cursor-not-allowed opacity-50',
          inv && 'ring-error_subtle',
          inv && isFocusWithin && 'ring-2 ring-error',
        )
      }
    >
      <select
        id={fieldId}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        defaultValue={defaultValue}
        className={cx(inputTextBase, 'cursor-pointer appearance-none')}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeValue(e.target.value)}
        onBlur={(e) => onBlurValue(e.target.value)}
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
    </AriaGroup>
  );
}

function CheckboxField({
  fieldId,
  label,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  helpText,
  helpId,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  label: string;
  defaultValue?: boolean;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  helpText?: string;
  helpId: string;
  onChangeValue: (v: boolean) => void;
  onBlurValue: (v: boolean) => void;
}): ReactNode {
  return (
    <AriaCheckbox
      id={fieldId}
      defaultSelected={Boolean(defaultValue)}
      isDisabled={disabled}
      aria-invalid={isInvalid || undefined}
      aria-describedby={ariaDescribedBy}
      onChange={(checked: boolean) => {
        onChangeValue(checked);
        onBlurValue(checked);
      }}
      className={({ isDisabled }) =>
        cx('flex items-start gap-2', isDisabled && 'cursor-not-allowed')
      }
    >
      {({ isSelected, isDisabled: dis, isFocusVisible }) => (
        <>
          {/* Custom checkbox visual matching Untitled UI CheckboxBase */}
          <div
            className={cx(
              'relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset mt-0.5',
              isSelected && 'bg-brand-solid ring-brand-solid',
              dis && 'cursor-not-allowed opacity-50',
              dis && !isSelected && 'bg-tertiary',
              isFocusVisible && 'outline-2 outline-offset-2 outline-focus-ring',
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 14 14"
              fill="none"
              className={cx(
                'pointer-events-none absolute size-3 text-fg-white opacity-0 transition-inherit-all',
                isSelected && 'opacity-100',
              )}
            >
              <path
                d={CHECKMARK_PATH}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Label + optional help text for checkbox placed inline */}
          <div className="inline-flex flex-col">
            <span className="text-sm font-medium text-secondary select-none">{label}</span>
            {helpText && (
              <span id={helpId} className="text-sm text-tertiary">
                {helpText}
              </span>
            )}
          </div>
        </>
      )}
    </AriaCheckbox>
  );
}

function TextareaField({
  fieldId,
  placeholder,
  defaultValue,
  disabled,
  isInvalid,
  ariaDescribedBy,
  onChangeValue,
  onBlurValue,
}: {
  fieldId: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  isInvalid: boolean;
  ariaDescribedBy?: string;
  onChangeValue: (v: string) => void;
  onBlurValue: (v: string) => void;
}): ReactNode {
  return (
    <AriaTextArea
      id={fieldId}
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-invalid={isInvalid || undefined}
      aria-describedby={ariaDescribedBy}
      rows={3}
      className={cx(
        'w-full scroll-py-3 rounded-lg bg-primary text-primary shadow-xs',
        'ring-1 ring-primary ring-inset transition duration-100 ease-linear',
        'placeholder:text-placeholder autofill:rounded-lg autofill:text-primary',
        'focus:outline-hidden focus:ring-2 focus:ring-brand',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'px-3.5 py-3 text-md min-h-[80px] resize-y',
        isInvalid && 'ring-error_subtle focus:ring-error',
      )}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChangeValue(e.target.value)}
      onBlur={(e) => onBlurValue((e.target as HTMLTextAreaElement).value)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main FormField component                                           */
/* ------------------------------------------------------------------ */

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
      const rules = buildRules(validation, type);
      const error = runValidation(value, rules, required);
      setInternalError(error);
    },
    [validation, required, type],
  );

  const handleChange = useCallback(
    (value: unknown) => {
      onChange(value);
      if (touched) {
        const rules = buildRules(validation, type);
        const error = runValidation(value, rules, required);
        setInternalError(error);
      }
    },
    [onChange, touched, validation, required, type],
  );

  const ariaDescribedBy =
    [displayError ? errorId : null, helpText ? helpId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const renderField = (): ReactNode => {
    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <TextInputField
            fieldId={fieldId}
            inputType={type === 'phone' ? 'tel' : type}
            placeholder={placeholder}
            defaultValue={defaultValue as string | undefined}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      case 'number':
        return (
          <NumberInputField
            fieldId={fieldId}
            placeholder={placeholder}
            defaultValue={defaultValue as number | undefined}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      case 'date':
        return (
          <DateInputField
            fieldId={fieldId}
            defaultValue={defaultValue as string | undefined}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      case 'select':
        return (
          <SelectField
            fieldId={fieldId}
            placeholder={placeholder}
            options={options}
            defaultValue={defaultValue as string | undefined}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            fieldId={fieldId}
            label={label}
            defaultValue={Boolean(defaultValue)}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            helpText={helpText}
            helpId={helpId}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      case 'textarea':
        return (
          <TextareaField
            fieldId={fieldId}
            placeholder={placeholder}
            defaultValue={defaultValue as string | undefined}
            disabled={disabled}
            isInvalid={isInvalid}
            ariaDescribedBy={ariaDescribedBy}
            onChangeValue={(v) => handleChange(v)}
            onBlurValue={(v) => handleBlur(v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div data-component="FormField" data-id={fieldId} className="flex flex-col gap-1.5">
      {/* Checkbox renders its own label inline */}
      {type !== 'checkbox' && (
        <FieldLabel htmlFor={fieldId} required={required} isInvalid={isInvalid}>
          {label}
        </FieldLabel>
      )}

      {renderField()}

      {displayError && (
        <HintText id={errorId} isInvalid>
          {displayError}
        </HintText>
      )}

      {helpText && type !== 'checkbox' && !displayError && (
        <HintText id={helpId}>{helpText}</HintText>
      )}
    </div>
  );
}
