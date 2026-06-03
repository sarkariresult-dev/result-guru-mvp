import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generalLimiter, getClientIp } from '@/lib/rate-limit';

const unsubscribeSchema = z.object({
  endpoint: z.string().url()
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await generalLimiter.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid unsubscribe payload', details: parsed.error.format() }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { endpoint } = parsed.data;

    const { error } = await supabaseAdmin
      .from('web_push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      void 0;
      return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }

    return NextResponse.json({ data: { message: 'Unsubscribed successfully' } });
  } catch (err) {
    void 0;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
