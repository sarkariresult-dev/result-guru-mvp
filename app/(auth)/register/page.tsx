import type { Metadata } from 'next'
import { SITE } from '@/config/site'
import RegisterForm from './RegisterForm'

/* ── SEO (noindex inherited from auth layout, title for browser tab) ── */
export const metadata: Metadata = {
    title: 'Create Account',
    description: `Create your free ${SITE.name} account to get personalised job alerts, bookmark posts, and track application deadlines.`,
}

/**
 * Register page - server component wrapper.
 * Renders the client-side RegisterForm.
 */
export default function RegisterPage() {
    return <RegisterForm />
}
