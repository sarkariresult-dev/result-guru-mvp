import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generalLimiter, getClientIp } from '@/lib/rate-limit';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  }),
  user_agent: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await generalLimiter.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription payload', details: parsed.error.format() }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const supabaseAdmin = createAdminClient();

    let userId = null;
    if (userData?.user?.id) {
      const { data: userRecord } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single();
      userId = userRecord?.id || null;
    }

    const { endpoint, keys, user_agent } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from('web_push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: user_agent || req.headers.get('user-agent'),
        last_used_at: new Date().toISOString()
      }, { onConflict: 'endpoint' })
      .select('id')
      .single();

    if (error) {
      void 0;
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ data: { id: data.id, message: 'Subscribed successfully' } });
  } catch (err) {
    void 0;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
