// Environment configuration for fsdk-ts
//
// fsdk-ts is the agnostic library: it reads ZERO environment variables and
// holds ZERO product-specific defaults. The consumer app injects all config
// once at entry via initEnv() (mirrors the initBillingApi() pattern).

export interface EnvConfig {
  apiUrl: string;
  foundationUrl: string;
  // Route the consumer app should be sent to after a forced (401) logout.
  // Configurable so apps that mount their login at a non-default path can override it.
  loginPath: string;
  // Google OAuth client id. Set to enable "Continue with Google" (useGoogleSignIn);
  // unset ⇒ the hook reports { available: false } and the consumer hides the button.
  googleClientId?: string;
  // Credentials mode `apiRequest` sends by default. Unset ⇒ 'include' (a cookie
  // session). An API authenticated by a Bearer token only can set 'omit', so the
  // browser attaches no ambient cookie. A per-call `credentials` option still wins.
  apiCredentials?: RequestCredentials;
  // Whether `apiRequest` fetches a CSRF token (`/api/v1/csrf-token`) before a
  // mutating call that sends credentials. Unset ⇒ true (today's behaviour). Set
  // false for an API whose mutating routes do not use CSRF (Bearer only).
  apiCsrf?: boolean;
  // Credentials mode `foundationRequest` sends by default. Unset ⇒ 'include'.
  foundationCredentials?: RequestCredentials;
}

let _cfg: EnvConfig = { apiUrl: '', foundationUrl: '', loginPath: '/login' };

// Called once by the consumer app at entry, with values read from its own env.
export function initEnv(cfg: Partial<EnvConfig>): void {
  _cfg = { ..._cfg, ...cfg };
}

// Live read — always returns the current config, so readers must call this at
// use time (not snapshot it at module load, which would capture pre-init values).
export const getEnvConfig = (): EnvConfig => _cfg;
