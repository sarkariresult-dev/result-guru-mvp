import type { Metadata } from 'next'
import { SITE } from '@/config/site'
import ForgotPasswordForm from './ForgotPasswordForm'

/* ── SEO (noindex inherited from auth layout, title for browser tab) ── */
export const metadata: Metadata = {
    title: 'Forgot Password',
    description: `Reset your ${SITE.name} password. We'll send a secure link to your email.`,
}

/**
 * Forgot password page — server component wrapper.
 * Renders the client-side ForgotPasswordForm.
 */
export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />
}
