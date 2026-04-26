import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

function makeProps(overrides?: Partial<FormFieldProps>): FormFieldProps {
  return {
    id: 'test-field',
    type: 'text',
    label: 'Test Label',
    onChange: vi.fn(),
    ...overrides,
  };
}

describe('FormField', () => {
  it('is a function component', () => {
    expect(typeof FormField).toBe('function');
  });

  it('renders text field with label', () => {
    render(<FormField {...makeProps()} />);
    expect(screen.getByText('Test Label')).toBeTruthy();
  });

  it('renders all 8 field types without throwing', () => {
    const types = ['text', 'number', 'date', 'select', 'checkbox', 'textarea', 'email', 'phone'] as const;
    for (const type of types) {
      const { unmount } = render(
        <FormField {...makeProps({ type, options: [{ value: 'a', label: 'A' }] })} />,
      );
      unmount();
    }
  });

  it('renders required indicator when required=true', () => {
    render(<FormField {...makeProps({ required: true })} />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders select with options', () => {
    const options = [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
    ];
    render(<FormField {...makeProps({ type: 'select', options })} />);
    expect(screen.getByText('France')).toBeTruthy();
    expect(screen.getByText('Germany')).toBeTruthy();
  });

  it('renders helpText when provided', () => {
    render(<FormField {...makeProps({ helpText: 'Enter your name' })} />);
    expect(screen.getByText('Enter your name')).toBeTruthy();
  });

  it('renders external errorMessage', () => {
    render(<FormField {...makeProps({ errorMessage: 'Field is invalid' })} />);
    expect(screen.getByText('Field is invalid')).toBeTruthy();
  });

  it('renders disabled input', () => {
    const { container } = render(<FormField {...makeProps({ disabled: true })} />);
    const input = container.querySelector('input') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(input?.disabled).toBe(true);
  });

  it('renders textarea type', () => {
    render(<FormField {...makeProps({ type: 'textarea', placeholder: 'Write here...' })} />);
    expect(screen.getByPlaceholderText('Write here...')).toBeTruthy();
  });

  it('renders checkbox type', () => {
    render(<FormField {...makeProps({ type: 'checkbox' })} />);
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('renders with placeholder', () => {
    render(<FormField {...makeProps({ placeholder: 'Enter value...' })} />);
    expect(screen.getByPlaceholderText('Enter value...')).toBeTruthy();
  });

  it('has proper aria attributes when in error', () => {
    const { container } = render(<FormField {...makeProps({ errorMessage: 'Error!' })} />);
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('aria-invalid')).toBeTruthy();
  });
});
