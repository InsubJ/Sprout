// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HabitForm } from '../components/habit/HabitForm';

describe('HabitForm Component', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
    root = null;
  });

  const renderComponent = (props: any) => {
    act(() => {
      root.render(React.createElement(HabitForm, props));
    });
  };

  // Helper to change input values in React-controlled DOM elements
  const changeInputValue = (
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string
  ) => {
    const prototype = Object.getPrototypeOf(input);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('renders all required form fields with default values', () => {
    renderComponent({ onSubmit: vi.fn() });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const descInput = document.getElementById('habit-description') as HTMLTextAreaElement;
    const freqSelect = document.getElementById('habit-frequency') as HTMLSelectElement;
    const wateringsInput = document.getElementById('habit-target-waterings') as HTMLInputElement;
    const witherInput = document.getElementById('habit-wither-threshold') as HTMLInputElement;

    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe('');

    expect(descInput).toBeTruthy();
    expect(descInput.value).toBe('');

    expect(freqSelect).toBeTruthy();
    expect(freqSelect.value).toBe('daily');

    expect(wateringsInput).toBeTruthy();
    expect(wateringsInput.value).toBe('30');

    expect(witherInput).toBeTruthy();
    expect(witherInput.value).toBe('3');
  });

  it('renders initial data when provided', () => {
    const initialData = {
      name: 'Drink Water',
      description: '8 glasses a day',
      frequency: 'weekly' as const,
      target_waterings: 7,
      wither_threshold: 2,
      flexible_rules: null
    };

    renderComponent({
      onSubmit: vi.fn(),
      initialData
    });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const descInput = document.getElementById('habit-description') as HTMLTextAreaElement;
    const freqSelect = document.getElementById('habit-frequency') as HTMLSelectElement;
    const wateringsInput = document.getElementById('habit-target-waterings') as HTMLInputElement;
    const witherInput = document.getElementById('habit-wither-threshold') as HTMLInputElement;

    expect(nameInput.value).toBe('Drink Water');
    expect(descInput.value).toBe('8 glasses a day');
    expect(freqSelect.value).toBe('weekly');
    expect(wateringsInput.value).toBe('7');
    expect(witherInput.value).toBe('2');
  });

  it('validates name input and displays error when empty', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });

    const form = document.querySelector('form') as HTMLFormElement;

    // Trigger form submit
    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Check error message
    const errorSpan = document.querySelector('[data-testid="error-name"]');
    expect(errorSpan).toBeTruthy();
    expect(errorSpan?.textContent).toBe('Name is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates waterings input and wither threshold are positive integers', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const wateringsInput = document.getElementById('habit-target-waterings') as HTMLInputElement;
    const witherInput = document.getElementById('habit-wither-threshold') as HTMLInputElement;
    const form = document.querySelector('form') as HTMLFormElement;

    act(() => {
      changeInputValue(nameInput, 'Exercise');
      changeInputValue(wateringsInput, '-5');
      changeInputValue(witherInput, '-2');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    const wateringsError = document.querySelector('[data-testid="error-target-waterings"]');
    const witherError = document.querySelector('[data-testid="error-wither-threshold"]');

    expect(wateringsError?.textContent).toBe('Target waterings must be a positive integer');
    expect(witherError?.textContent).toBe('Wither threshold must be a positive integer');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows flexible rules section when frequency is set to flexible', async () => {
    renderComponent({ onSubmit: vi.fn() });

    const freqSelect = document.getElementById('habit-frequency') as HTMLSelectElement;

    // Check that flexible rules container doesn't exist by default
    let flexibleSection = document.querySelector('[data-testid="flexible-rules-section"]');
    expect(flexibleSection).toBeNull();

    // Change frequency to flexible
    act(() => {
      changeInputValue(freqSelect, 'flexible');
    });

    flexibleSection = document.querySelector('[data-testid="flexible-rules-section"]');
    expect(flexibleSection).toBeTruthy();

    const daysRequiredInput = document.getElementById('habit-flexible-days-required') as HTMLInputElement;
    const daysTotalInput = document.getElementById('habit-flexible-days-total') as HTMLInputElement;

    expect(daysRequiredInput.value).toBe('3');
    expect(daysTotalInput.value).toBe('7');
  });

  it('validates flexible rules and ensures required days <= total days', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const freqSelect = document.getElementById('habit-frequency') as HTMLSelectElement;
    const form = document.querySelector('form') as HTMLFormElement;

    act(() => {
      changeInputValue(nameInput, 'Exercise');
      changeInputValue(freqSelect, 'flexible');
    });

    const daysRequiredInput = document.getElementById('habit-flexible-days-required') as HTMLInputElement;
    const daysTotalInput = document.getElementById('habit-flexible-days-total') as HTMLInputElement;

    act(() => {
      changeInputValue(daysRequiredInput, '6');
      changeInputValue(daysTotalInput, '5');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    const rulesError = document.querySelector('[data-testid="error-flexible-rules"]');
    expect(rulesError?.textContent).toBe('Required days cannot exceed total days');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correctly parsed form data on successful submit', async () => {
    const onSubmit = vi.fn();
    renderComponent({ onSubmit });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const descInput = document.getElementById('habit-description') as HTMLTextAreaElement;
    const freqSelect = document.getElementById('habit-frequency') as HTMLSelectElement;
    const wateringsInput = document.getElementById('habit-target-waterings') as HTMLInputElement;
    const witherInput = document.getElementById('habit-wither-threshold') as HTMLInputElement;
    const form = document.querySelector('form') as HTMLFormElement;

    act(() => {
      changeInputValue(nameInput, 'Meditation');
      changeInputValue(descInput, '10 minutes daily breathing exercises');
      changeInputValue(freqSelect, 'daily');
      changeInputValue(wateringsInput, '15');
      changeInputValue(witherInput, '5');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Meditation',
      description: '10 minutes daily breathing exercises',
      frequency: 'daily',
      target_waterings: 15,
      wither_threshold: 5,
      flexible_rules: null
    });
  });

  it('calls onCancel callback when cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderComponent({
      onSubmit: vi.fn(),
      onCancel
    });

    const cancelBtn = document.querySelector('button[type="button"]') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();

    act(() => {
      cancelBtn.click();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables inputs and buttons during isSubmitting', () => {
    renderComponent({
      onSubmit: vi.fn(),
      isSubmitting: true,
      onCancel: vi.fn()
    });

    const nameInput = document.getElementById('habit-name') as HTMLInputElement;
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    const cancelBtn = document.querySelector('button[type="button"]') as HTMLButtonElement;

    expect(nameInput.disabled).toBe(true);
    expect(submitBtn.disabled).toBe(true);
    expect(cancelBtn.disabled).toBe(true);
    expect(submitBtn.textContent).toBe('Saving...');
  });
});