// @vitest-environment happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders, useAuth } from '../components/common/AppProviders';

// Helper component to verify hooks
const TestApp = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.currentUser ? auth.currentUser.username : 'Guest'}</div>
      <div data-testid="locked">{auth.isAppLocked ? 'Locked' : 'Unlocked'}</div>
      <div data-testid="pin-val">{auth.pinCode || 'No PIN'}</div>
      <div data-testid="bio-val">{auth.biometricsEnabled ? 'Bio Enabled' : 'Bio Disabled'}</div>
      
      <button data-testid="login-btn" onClick={() => auth.login('test_alice')}>
        Login Alice
      </button>
      <button data-testid="login-google-btn" onClick={() => auth.loginWithProvider('google')}>
        Login Google
      </button>
      <button data-testid="set-pin-btn" onClick={() => auth.setPinCode('4321')}>
        Set PIN
      </button>
      <button data-testid="unlock-pin-btn" onClick={() => auth.unlockApp('4321')}>
        Unlock PIN
      </button>
      <button data-testid="unlock-bio-btn" onClick={() => auth.unlockApp(undefined, true)}>
        Unlock Bio
      </button>
      <button data-testid="lock-btn" onClick={() => auth.lockApp()}>
        Lock App
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('Auth & PIN/Biometric Security System', () => {
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
          <TestApp />
        </AppProviders>
      );
    });
  };

  it('initializes with guest user and unlocked state', async () => {
    renderComponent();
    
    // Wait for AppProviders loading finish
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    
    const user = document.querySelector('[data-testid="user"]');
    const locked = document.querySelector('[data-testid="locked"]');
    expect(user?.textContent).toBe('Guest');
    expect(locked?.textContent).toBe('Unlocked');
  });

  it('locks the app when user has a PIN code set', async () => {
    renderComponent();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Login Alice
    const loginBtn = document.querySelector('[data-testid="login-btn"]');
    await act(async () => {
      loginBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Set PIN
    const setPinBtn = document.querySelector('[data-testid="set-pin-btn"]');
    await act(async () => {
      setPinBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(document.querySelector('[data-testid="pin-val"]')?.textContent).toBe('4321');

    // Trigger lockApp
    const lockBtn = document.querySelector('[data-testid="lock-btn"]');
    await act(async () => {
      lockBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(document.querySelector('[data-testid="locked"]')?.textContent).toBe('Locked');

    // Try unlock with correct PIN
    const unlockPinBtn = document.querySelector('[data-testid="unlock-pin-btn"]');
    await act(async () => {
      unlockPinBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(document.querySelector('[data-testid="locked"]')?.textContent).toBe('Unlocked');
  });

  it('supports social login provider profile mock generation', async () => {
    renderComponent();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Click social google login
    const googleBtn = document.querySelector('[data-testid="login-google-btn"]');
    await act(async () => {
      googleBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    const user = document.querySelector('[data-testid="user"]');
    expect(user?.textContent).toBe('google_user');
  });
});
