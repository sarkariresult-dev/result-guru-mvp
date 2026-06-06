import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BroadcastForm } from './BroadcastForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Broadcasts | Result Guru Admin',
};

export default async function BroadcastsPage() {
  const supabase = await createServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    redirect('/login');
  }

  const role = userData.user.user_metadata?.user_role || userData.user.app_metadata?.user_role;
  if (role !== 'admin') {
    redirect('/admin');
  }

  // Fetch metrics (use Admin client to bypass RLS and get all users' subscriptions)
  const supabaseAdmin = createAdminClient();

  const { count: pushSubscriberCount } = await supabaseAdmin
    .from('web_push_subscriptions')
    .select('*', { count: 'exact', head: true });

  const { count: emailSubscriberCount } = await supabaseAdmin
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: broadcasts } = await supabaseAdmin
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: subscribers } = await supabaseAdmin
    .from('web_push_subscriptions')
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Broadcast Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Push Subscribers</CardTitle>
              <CardDescription>Total devices opted-in to web push notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{pushSubscriberCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Email Subscribers</CardTitle>
              <CardDescription>Total active email newsletter subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{emailSubscriberCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send New Broadcast</CardTitle>
            <CardDescription>Send a notification or newsletter to active subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <BroadcastForm />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4">Past Broadcasts</h2>
      <Card>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Channel</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Subject</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Sent</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Clicks</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {broadcasts?.map((b) => (
                <tr key={b.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      b.channel === 'email' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {b.channel}
                    </span>
                  </td>
                  <td className="p-4 align-middle font-medium">{b.subject}</td>
                  <td className="p-4 align-middle">{b.sent_count}</td>
                  <td className="p-4 align-middle">{b.click_count}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      b.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!broadcasts?.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-foreground-muted">No broadcasts sent yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4">Web Push Subscriber List (Latest 100)</h2>
      <Card>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Endpoint / Provider</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Device / Browser</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-foreground-muted">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {subscribers?.map((sub) => {
                let host = sub.endpoint;
                try {
                  host = new URL(sub.endpoint).hostname;
                } catch {
                  // Ignore
                }

                return (
                  <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      {sub.users?.email ? (
                        <span className="font-medium text-foreground">{sub.users.email}</span>
                      ) : (
                        <span className="text-foreground-muted italic">Anonymous</span>
                      )}
                    </td>
                    <td className="p-4 align-middle max-w-[200px] truncate" title={sub.endpoint}>
                      {host}
                    </td>
                    <td className="p-4 align-middle max-w-[300px] truncate text-foreground-subtle" title={sub.user_agent || 'Unknown'}>
                      {sub.user_agent || 'Unknown'}
                    </td>
                    <td className="p-4 align-middle text-foreground-subtle whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {!subscribers?.length && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-foreground-muted">No subscribers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
