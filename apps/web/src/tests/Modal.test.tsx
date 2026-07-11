// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Modal } from '../components/common/Modal';

describe('Modal Component', () => {
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
      root.render(React.createElement(Modal, props));
    });
  };

  it('renders children and header when isOpen is true', () => {
    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      title: 'Test Modal Title',
      children: <div data-testid="modal-child-content">Hello Modal Body</div>,
    });

    const overlay = document.querySelector('[data-testid="modal-overlay"]');
    const content = document.querySelector('[data-testid="modal-content"]');
    const title = document.querySelector('[data-testid="modal-title"]');
    const body = document.querySelector('[data-testid="modal-body"]');

    expect(overlay).toBeTruthy();
    expect(content).toBeTruthy();
    expect(title?.textContent).toBe('Test Modal Title');
    expect(body?.textContent).toBe('Hello Modal Body');
  });

  it('does not render anything when isOpen is false', () => {
    renderComponent({
      isOpen: false,
      onClose: vi.fn(),
      title: 'Hidden Modal',
      children: <div>Should not be visible</div>,
    });

    const overlay = document.querySelector('[data-testid="modal-overlay"]');
    expect(overlay).toBeNull();
  });

  it('invokes onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderComponent({
      isOpen: true,
      onClose,
      title: 'Modal',
    });

    const closeBtn = document.querySelector('[data-testid="modal-close-button"]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    renderComponent({
      isOpen: true,
      onClose,
    });

    const overlay = document.querySelector('[data-testid="modal-overlay"]') as HTMLDivElement;
    expect(overlay).toBeTruthy();

    act(() => {
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    renderComponent({
      isOpen: true,
      onClose,
    });

    const content = document.querySelector('[data-testid="modal-content"]') as HTMLDivElement;
    expect(content).toBeTruthy();

    act(() => {
      content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('invokes onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    renderComponent({
      isOpen: true,
      onClose,
    });

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('throws error when design contract is violated (invalid props)', () => {
    // Suppress console.error output during this test to keep test runs clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderComponent({
        isOpen: 'not-a-boolean' as any,
        onClose: vi.fn(),
      });
    }).toThrow('Precondition failed: isOpen must be a boolean');

    expect(() => {
      renderComponent({
        isOpen: true,
        onClose: 'not-a-function' as any,
      });
    }).toThrow('Precondition failed: onClose must be a function');

    consoleSpy.mockRestore();
  });

  it('traps focus correctly and cycles focusable elements', () => {
    // Render Modal with some interactive elements
    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      children: (
        <div>
          <button id="btn1" data-testid="btn1">Button 1</button>
          <button id="btn2" data-testid="btn2">Button 2</button>
        </div>
      ),
    });

    const btn1 = document.getElementById('btn1') as HTMLButtonElement;
    const btn2 = document.getElementById('btn2') as HTMLButtonElement;
    const closeBtn = document.querySelector('[data-testid="modal-close-button"]') as HTMLButtonElement;

    // Ordered list of focusable elements inside the modal:
    // 1. Close Button (in header)
    // 2. Button 1 (in children)
    // 3. Button 2 (in children)
    
    // When opened, the first focusable element should get focus automatically
    expect(document.activeElement).toBe(closeBtn);

    // Focus second element
    act(() => {
      btn2.focus();
    });
    expect(document.activeElement).toBe(btn2);

    // Press Tab from the last element (btn2). It should wrap around to the first element (closeBtn).
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      document.dispatchEvent(event);
    });
    expect(document.activeElement).toBe(closeBtn);

    // Focus first element (closeBtn) and press Shift+Tab. It should wrap around to the last element (btn2).
    act(() => {
      closeBtn.focus();
    });
    expect(document.activeElement).toBe(closeBtn);

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      document.dispatchEvent(event);
    });
    expect(document.activeElement).toBe(btn2);
  });
});
