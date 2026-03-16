const PRODUCTION_API_URL = 'https://goals.keycasey.com';

const trimTrailingSlash = (url: string): string =>
  url.endsWith('/') ? url.slice(0, -1) : url;

const isPrivateDevHostname = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
  /^192\.168\.\d+\.\d+$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname) ||
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d+\.\d+$/.test(hostname);

const isProductionHostname = (hostname: string): boolean =>
  hostname === 'goals.keycasey.com' || hostname === 'www.goals.keycasey.com';

export const resolveApiUrl = ({
  mode,
  origin,
  envUrl,
}: {
  mode: string;
  origin?: string;
  envUrl?: string;
}): string => {
  const normalizedEnvUrl = envUrl ? trimTrailingSlash(envUrl) : undefined;

  if (origin) {
    const url = new URL(origin);

    if (mode === 'development' && isPrivateDevHostname(url.hostname)) {
      url.port = '3001';
      return trimTrailingSlash(url.toString());
    }

    if (isProductionHostname(url.hostname)) {
      return trimTrailingSlash(url.origin);
    }

    return normalizedEnvUrl ?? PRODUCTION_API_URL;
  }

  if (normalizedEnvUrl) {
    return normalizedEnvUrl;
  }

  return mode === 'development' ? 'http://localhost:3001' : PRODUCTION_API_URL;
};

export const getApiUrl = (): string =>
  resolveApiUrl({
    mode: import.meta.env.MODE,
    origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    envUrl: import.meta.env.VITE_API_URL,
  });

export const API_BASE_URL = getApiUrl();
// CACHE BUST 1770691342
export const CACHE_BUST = 'v' + Date.now();
