import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// The GIS script picks the button's language from the `hl` query parameter of
// the script URL (renderButton's `locale` option is ignored in practice). These
// tests pin that `initEnv({ googleLocale })` reaches the script URL, and that
// leaving it unset keeps the URL exactly as before.

vi.mock('../hooks/auth/useGoogleLogin', () => ({
  useGoogleLogin: () => ({ googleLogin: vi.fn(), isLoading: false, error: null }),
}));

const BASE = 'https://accounts.google.com/gsi/client';

function gisScripts(): HTMLScriptElement[] {
  return Array.from(document.querySelectorAll<HTMLScriptElement>('script')).filter((s) =>
    s.src.startsWith(BASE)
  );
}

async function freshModules() {
  vi.resetModules();
  const env = await import('../utils/env');
  const hook = await import('../hooks/auth/useGoogleSignIn');
  return { env, hook };
}

describe('useGoogleSignIn: GIS script language (hl)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as { google?: unknown }).google;
  });
  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('unset googleLocale: script URL has no hl (default behaviour unchanged)', async () => {
    const { env, hook } = await freshModules();
    env.initEnv({ googleClientId: 'cid.apps.googleusercontent.com' });
    renderHook(() => hook.useGoogleSignIn());
    const scripts = gisScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute('src')).toBe(BASE);
  });

  it('googleLocale "en" appends ?hl=en', async () => {
    const { env, hook } = await freshModules();
    env.initEnv({ googleClientId: 'cid.apps.googleusercontent.com', googleLocale: 'en' });
    renderHook(() => hook.useGoogleSignIn());
    const scripts = gisScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute('src')).toBe(`${BASE}?hl=en`);
  });

  it('region tags are kept (en-GB)', async () => {
    const { hook } = await freshModules();
    expect(hook.gisScriptSrc('en-GB')).toBe(`${BASE}?hl=en-GB`);
    expect(hook.gisScriptSrc('ar')).toBe(`${BASE}?hl=ar`);
  });

  it('an invalid tag is ignored rather than injected into the URL', async () => {
    const { hook } = await freshModules();
    expect(hook.gisScriptSrc('en"><script>')).toBe(BASE);
    expect(hook.gisScriptSrc('en&foo=bar')).toBe(BASE);
    expect(hook.gisScriptSrc('')).toBe(BASE);
    expect(hook.gisScriptSrc('   ')).toBe(BASE);
    expect(hook.gisScriptSrc(undefined)).toBe(BASE);
  });

  it('surrounding whitespace is trimmed', async () => {
    const { hook } = await freshModules();
    expect(hook.gisScriptSrc(' en ')).toBe(`${BASE}?hl=en`);
  });

  it('an already-present GIS script (any hl) is reused, not injected twice', async () => {
    const pre = document.createElement('script');
    pre.src = `${BASE}?hl=fr`;
    document.head.appendChild(pre);
    const { env, hook } = await freshModules();
    env.initEnv({ googleClientId: 'cid.apps.googleusercontent.com', googleLocale: 'en' });
    renderHook(() => hook.useGoogleSignIn());
    expect(gisScripts()).toHaveLength(1);
  });

  it('no client id: no script is injected even with a locale', async () => {
    const { env, hook } = await freshModules();
    env.initEnv({ googleClientId: undefined, googleLocale: 'en' });
    renderHook(() => hook.useGoogleSignIn());
    expect(gisScripts()).toHaveLength(0);
  });
});
