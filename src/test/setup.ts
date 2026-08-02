import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// framer-motion: replace all motion.* and AnimatePresence with plain pass-throughs
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');

  // Factory: produce a plain div/span/etc wrapper that strips motion props
  const makeMotionComponent = (tag: string) =>
    function MotionEl({
      children,
      initial, animate, exit, transition, variants, custom,
      whileHover, whileTap, whileFocus, whileDrag, whileInView,
      layoutId, layout,
      ...props
    }: Record<string, unknown>) {
      return React.createElement(tag, props as React.HTMLAttributes<Element>, children as React.ReactNode);
    };

  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop: string) {
      return makeMotionComponent(prop);
    },
  };

  return {
    motion: new Proxy({} as Record<string, unknown>, handler),
    AnimatePresence({ children }: { children: React.ReactNode }) { return children; },
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useInView: () => true,
    useMotionValue: (v: unknown) => ({ get: () => v, set: vi.fn(), subscribe: vi.fn() }),
    useTransform: () => ({ get: vi.fn(), set: vi.fn() }),
    useSpring: (v: unknown) => ({ get: () => v, set: vi.fn() }),
  };
});

// ---------------------------------------------------------------------------
// react-i18next — stable `t` reference so components with useCallback([t])
// don't recreate their callbacks on every render (infinite-re-render guard)
// ---------------------------------------------------------------------------
vi.mock('react-i18next', () => {
  // Module-level single function → same reference on every call
  const t = (key: string) => key;
  const i18n = { language: 'en', changeLanguage: () => Promise.resolve() };
  return {
    useTranslation: () => ({ t, i18n }),
    Trans: ({ children }: { children: unknown }) => children,
    initReactI18next: { type: '3rdParty' as const, init: () => {} },
  };
});

// ---------------------------------------------------------------------------
// react-router-dom — keep BrowserRouter/MemoryRouter real; stub useNavigate
// ---------------------------------------------------------------------------
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// sonner
// ---------------------------------------------------------------------------
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Browser API stubs
// ---------------------------------------------------------------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Reset fetch stub after every test
afterEach(() => {
  vi.unstubAllGlobals();
});
