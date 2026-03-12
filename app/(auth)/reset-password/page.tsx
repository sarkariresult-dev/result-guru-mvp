import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

/* ── SEO (noindex inherited from auth layout, title for browser tab) ── */
export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Set a new password for your account.',
}

/**
 * Reset password page - server component wrapper.
 * Renders the client-side ResetPasswordForm.
 */
export default function ResetPasswordPage() {
    return <ResetPasswordForm />
}
