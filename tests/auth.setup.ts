import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const authFile = path.join(process.cwd(), 'playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured');
  }

  // Ensure storage state directory exists
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  if (!email || !password) {
    // Write empty state to prevent Playwright ENOENT crash
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    return;
  }

  // 1. Programmatically log in via Supabase client to fetch a fresh JWT session
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    // Write empty state to prevent Playwright ENOENT crash
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    return;
  }

  // 2. Extract project ID from supabase URL to form the exact localStorage key
  const projectId = new URL(supabaseUrl).hostname.split('.')[0];
  const localStorageKey = `sb-${projectId}-auth-token`;

  // 3. Load a blank page on the target origin to set localStorage
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: localStorageKey, value: data.session }
  );

  // 4. Save the authenticated storage state to a local file
  await page.context().storageState({ path: authFile });
});
