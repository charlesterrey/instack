import type { ReactNode } from 'react';

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

export function FormField(props: FormFieldProps): ReactNode {
  return (
    <div data-component="FormField" data-id={props.id}>
      <label>{props.label}</label>
      <div>{`[FormField: ${props.type}]`}</div>
    </div>
  );
}
