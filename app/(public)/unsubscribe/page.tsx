import { createAdminClient } from '@/lib/supabase/admin'
import { CheckCircle2, XCircle, MailWarning } from 'lucide-react'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata({
  title: 'Unsubscribe | Result Guru',
  description: 'Unsubscribe from the Result Guru newsletter.',
  path: '/unsubscribe',
})

type SearchParams = Promise<{ token?: string }>

export default async function UnsubscribePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const token = params.token

  let success = false
  let errorMessage = ''

  if (!token) {
    errorMessage = 'Invalid or missing unsubscribe token.'
  } else {
    try {
      const supabaseAdmin = createAdminClient()
      const { data, error } = await supabaseAdmin
        .from('subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .eq('status', 'active')
        .select('id')
        .maybeSingle()

      if (error) {
        console.error('[unsubscribe] DB error:', error)
        errorMessage = 'An error occurred while processing your request. Please try again.'
      } else if (!data) {
        // If not found in 'active', let's check if they are already unsubscribed
        const { data: existing } = await supabaseAdmin
          .from('subscribers')
          .select('status')
          .eq('unsubscribe_token', token)
          .maybeSingle()

        if (existing?.status === 'unsubscribed') {
          success = true // Already unsubscribed, treat as success
        } else {
          errorMessage = 'The unsubscribe link is invalid or expired.'
        }
      } else {
        success = true
      }
    } catch (err) {
      console.error('[unsubscribe] Unexpected error:', err)
      errorMessage = 'An unexpected error occurred. Please try again.'
    }
  }

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950/20">
      {/* Background Decorative Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[2.5rem] border border-border bg-surface p-8 shadow-2xl md:p-12">
          <div className="flex flex-col items-center text-center">
            {success ? (
              <>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success border border-success/20">
                  <CheckCircle2 className="h-9 w-9 stroke-[1.5]" />
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-tight sm:text-3xl mb-3">
                  Unsubscribed Successfully
                </h1>
                <p className="text-foreground-muted mb-8 text-sm leading-relaxed">
                  You have been removed from our email list. You will no longer receive newsletter updates from Result Guru.
                </p>
              </>
            ) : (
              <>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error border border-error/20">
                  <XCircle className="h-9 w-9 stroke-[1.5]" />
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-tight sm:text-3xl mb-3">
                  Unsubscribe Failed
                </h1>
                <p className="text-foreground-muted mb-8 text-sm leading-relaxed">
                  {errorMessage || 'We were unable to process your request.'}
                </p>
              </>
            )}

            <div className="w-full space-y-3">
              <Link
                href="/"
                className="flex w-full items-center justify-center rounded-xl bg-primary py-3 px-4 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95"
              >
                Go to Homepage
              </Link>
              <div className="text-xs text-foreground-muted flex items-center justify-center gap-1.5 mt-4">
                <MailWarning className="size-3.5" />
                <span>Changed your mind? Subscribe again on the homepage.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
