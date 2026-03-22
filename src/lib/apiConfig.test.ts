import { describe, expect, it } from 'vitest';

import { resolveApiUrl } from './apiConfig';

describe('resolveApiUrl', () => {
  it('uses port 3001 for localhost development', () => {
    expect(
      resolveApiUrl({
        mode: 'development',
        origin: 'http://localhost:8080',
      }),
    ).toBe('http://localhost:3001');
  });

  it('uses port 3001 for 0.0.0.0 development', () => {
    expect(
      resolveApiUrl({
        mode: 'development',
        origin: 'http://0.0.0.0:8080',
      }),
    ).toBe('http://0.0.0.0:3001');
  });

  it('uses port 3001 for private network development', () => {
    expect(
      resolveApiUrl({
        mode: 'development',
        origin: 'http://100.82.23.47:8080',
      }),
    ).toBe('http://100.82.23.47:3001');
  });

  it('keeps production same-origin on goals.keycasey.com', () => {
    expect(
      resolveApiUrl({
        mode: 'production',
        origin: 'https://goals.keycasey.com',
      }),
    ).toBe('https://goals.keycasey.com');
  });

  it('routes lovable previews to the production API', () => {
    expect(
      resolveApiUrl({
        mode: 'development',
        origin:
          'https://id-preview--595ad3d6-9a38-49fb-8663-93ceef31952f.lovable.app',
      }),
    ).toBe('https://goals.keycasey.com');
  });
});
