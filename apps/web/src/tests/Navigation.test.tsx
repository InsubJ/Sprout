// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '../components/common/AppProviders';
import { Navigation } from '../components/common/Navigation';

// Mock next/navigation
const mockPush = vi.fn();
let mockPathname = '/forest/bob';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Navigation Interceptor Modal', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      length: 0,
      key: (index: number) => null,
    } as any;

    mockPush.mockClear();
    mockPathname = '/forest/bob'; // Default visiting friend
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

  const renderComponent = () => {
    act(() => {
      root.render(
        <AppProviders>
          <Navigation />
        </AppProviders>
      );
    });
  };

  it('renders navigation links and intercepts when visiting a friend', async () => {
    // Save a logged-in user profile in localStorage so AppProviders loads it immediately
    const mockUser = { id: '11111111-1111-1111-1111-111111111111', username: 'alice', display_name: 'Alice' };
    localStorage.setItem('sprout_current_user', JSON.stringify(mockUser));

    renderComponent();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // We are on '/forest/bob' (visiting friend Bob), so isVisitingFriend should be true.
    // Try clicking the "Lab" navigation link (href: '/lab')
    const labLink = document.querySelector('header nav a[href="/lab"]') as HTMLAnchorElement;
    expect(labLink).toBeTruthy();

    // Click link to trigger confirmation modal
    act(() => {
      labLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Modal should render
    const modal = document.querySelector('[data-testid="leave-confirm-modal"]');
    expect(modal).toBeTruthy();
    expect(modal?.querySelector('h3')?.textContent).toBe("Leave Friend's Forest?");

    // Click "Stay Here" (cancel)
    const cancelBtn = document.querySelector('[data-testid="cancel-leave-btn"]') as HTMLButtonElement;
    act(() => {
      cancelBtn.click();
    });

    // Modal should be gone, push should not have been called
    expect(document.querySelector('[data-testid="leave-confirm-modal"]')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();

    // Click again to verify confirm button works
    act(() => {
      labLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    
    const confirmBtn = document.querySelector('[data-testid="confirm-leave-btn"]') as HTMLButtonElement;
    act(() => {
      confirmBtn.click();
    });

    // Should redirect to target href
    expect(mockPush).toHaveBeenCalledWith('/lab');
  });

  it('does not intercept when viewing own forest/sanctuary', async () => {
    const mockUser = { id: '11111111-1111-1111-1111-111111111111', username: 'alice', display_name: 'Alice' };
    localStorage.setItem('sprout_current_user', JSON.stringify(mockUser));
    
    // Set pathname to own sanctuary
    mockPathname = '/sanctuary/alice';

    renderComponent();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const labLink = document.querySelector('header nav a[href="/lab"]') as HTMLAnchorElement;
    act(() => {
      labLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Modal should not show up
    expect(document.querySelector('[data-testid="leave-confirm-modal"]')).toBeNull();
  });
});
