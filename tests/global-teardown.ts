import { createAdminClient } from '../lib/supabase/admin';
import './load-env';

async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return;
  }

  try {
    const admin = createAdminClient();

    // 1. Clean up post records created during E2E runs
    await admin
      .from('posts')
      .delete()
      .like('slug', 'e2e-test-%');

    // 2. Clean up tag records created during E2E runs
    await admin
      .from('tags')
      .delete()
      .like('slug', 'e2e-test-%');
  } catch (error: unknown) {
    // Silent catch
  }
}

export default globalTeardown;
