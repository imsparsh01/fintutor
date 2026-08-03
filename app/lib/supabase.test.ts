// supabase.ts computes isSupabaseConfigured/supabase once, at import time, from
// process.env — so each scenario needs a fresh module instance with its own env
// state. jest.isolateModules + jest.resetModules gives each `require` here a
// clean module registry to import into.
//
// The RN-facing imports (AsyncStorage, the URL polyfill, the real Supabase
// client) are mocked out: this test is about our own derived-config logic
// (D-052's "degrade to null rather than throw" pattern), not about
// @supabase/supabase-js's or AsyncStorage's internals.

jest.mock('react-native-url-polyfill/auto', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ __mockSupabaseClient: true })),
}));

const ENV_KEYS = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] as const;

function loadSupabaseModuleWithEnv(env: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  let mod: typeof import('./supabase');
  jest.isolateModules(() => {
    for (const key of ENV_KEYS) {
      if (env[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = env[key];
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('./supabase');
  });
  return mod!;
}

describe('supabase config detection', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('is configured when both URL and anon key are present', () => {
    const { isSupabaseConfigured, supabase } = loadSupabaseModuleWithEnv({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(isSupabaseConfigured).toBe(true);
    expect(supabase).not.toBeNull();
  });

  it('is not configured when both are absent', () => {
    const { isSupabaseConfigured, supabase } = loadSupabaseModuleWithEnv({});
    expect(isSupabaseConfigured).toBe(false);
    expect(supabase).toBeNull();
  });

  it('is not configured when only the URL is present', () => {
    const { isSupabaseConfigured, supabase } = loadSupabaseModuleWithEnv({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    });
    expect(isSupabaseConfigured).toBe(false);
    expect(supabase).toBeNull();
  });

  it('is not configured when only the anon key is present', () => {
    const { isSupabaseConfigured, supabase } = loadSupabaseModuleWithEnv({
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(isSupabaseConfigured).toBe(false);
    expect(supabase).toBeNull();
  });

  it('is not configured when either value is an empty string', () => {
    const { isSupabaseConfigured } = loadSupabaseModuleWithEnv({
      EXPO_PUBLIC_SUPABASE_URL: '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(isSupabaseConfigured).toBe(false);
  });
});
