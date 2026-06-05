import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { generalLimiter, getClientIp } from '@/lib/rate-limit'

const pushClickSchema = z.object({
  broadcastId: z.string().uuid('broadcastId must be a valid UUID'),
})

/**
 * POST /api/analytics/push-click
 *
 * Called from the service worker's `notificationclick` event handler
 * to increment the click_count for a given broadcast.
 * Uses adminClient to bypass RLS (the SW has no auth context).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const { success } = await generalLimiter.limit(ip)

    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = pushClickSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 },
      )
    }

    const { broadcastId } = parsed.data
    const supabaseAdmin = createAdminClient()

    // Fetch current click_count, then increment
    const { data: broadcast, error: fetchErr } = await supabaseAdmin
      .from('broadcasts')
      .select('click_count')
      .eq('id', broadcastId)
      .single()

    if (fetchErr || !broadcast) {
      console.error('[push-click] Broadcast not found:', broadcastId, fetchErr)
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })
    }

    const { error: updateErr } = await supabaseAdmin
      .from('broadcasts')
      .update({ click_count: broadcast.click_count + 1 })
      .eq('id', broadcastId)

    if (updateErr) {
      console.error('[push-click] Failed to increment click_count:', updateErr)
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }

    return NextResponse.json({ data: { tracked: true } })
  } catch (err) {
    console.error('[push-click] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
