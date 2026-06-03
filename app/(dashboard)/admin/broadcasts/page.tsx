import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BroadcastForm } from './BroadcastForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Push Broadcasts | Result Guru Admin',
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

  const { count: subscriberCount } = await supabaseAdmin
    .from('web_push_subscriptions')
    .select('*', { count: 'exact', head: true });

  const { data: broadcasts } = await supabaseAdmin
    .from('broadcasts')
    .select('*')
    .eq('channel', 'push')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Push Broadcasts</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Subscribers</CardTitle>
            <CardDescription>Total users opted-in to web push notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{subscriberCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send New Broadcast</CardTitle>
            <CardDescription>Send a notification to all active subscribers</CardDescription>
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
                  <td className="p-4 align-middle font-medium">{b.subject}</td>
                  <td className="p-4 align-middle">{b.sent_count}</td>
                  <td className="p-4 align-middle">{b.click_count}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${b.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!broadcasts?.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-foreground-muted">No broadcasts sent yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
