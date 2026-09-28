import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// API-FIRST WP7 (REVWP7 #4): the media calls and the profile-picture hook reach the
// foundation surface too, so they honour foundationCredentials. Default unchanged.

type FetchMock = ReturnType<typeof vi.fn>;
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

async function fresh(extra: Record<string, unknown> = {}) {
  vi.resetModules();
  const env = await import('../utils/env');
  env.initEnv({ apiUrl: 'https://api.test', foundationUrl: 'https://f.test', loginPath: '/login', ...extra });
  const media = await import('../api/media');
  const hook = await import('../hooks/account/useProfilePicture');
  return { media, hook };
}

describe('foundationCredentials on media + profile picture', () => {
  let fetchMock: FetchMock;
  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  for (const [label, extra, expected] of [
    ['default', {}, 'include'],
    ["'omit'", { foundationCredentials: 'omit' }, 'omit'],
  ] as const) {
    it(`mediaApi.getGallery sends credentials ${expected} (${label})`, async () => {
      const { media } = await fresh(extra);
      fetchMock.mockResolvedValueOnce(ok([]));
      await media.mediaApi.getGallery('experience', '1');
      expect(fetchMock.mock.calls[0][1].credentials).toBe(expected);
    });

    it(`useProfilePicture load sends credentials ${expected} (${label})`, async () => {
      const { hook } = await fresh(extra);
      fetchMock.mockResolvedValue(ok({ url: null }));
      renderHook(() => hook.useProfilePicture('7'));
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(fetchMock.mock.calls[0][0]).toBe('https://f.test/media/profile-picture/7');
      expect(fetchMock.mock.calls[0][1].credentials).toBe(expected);
    });

    it(`useProfilePicture upload sends credentials ${expected} (${label})`, async () => {
      const { hook } = await fresh(extra);
      fetchMock.mockResolvedValue(ok({ url: 'u' }));
      const { result } = renderHook(() => hook.useProfilePicture(''));
      const file = new File(['x'], 'a.png', { type: 'image/png' });
      await act(async () => { await result.current.uploadProfilePicture(file); });
      const upload = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/media/upload/profile-picture'));
      expect(upload).toBeDefined();
      expect(upload![1].credentials).toBe(expected);
    });
  }

  it('deleteMedia (another verb) honours foundationCredentials too', async () => {
    const { media } = await fresh({ foundationCredentials: 'omit' });
    fetchMock.mockResolvedValueOnce(ok({}));
    await media.mediaApi.deleteMedia(3);
    expect(fetchMock.mock.calls[0][1].credentials).toBe('omit');
  });
});
