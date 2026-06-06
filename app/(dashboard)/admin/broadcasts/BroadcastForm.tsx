'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';
import { sendPushBroadcast, sendEmailBroadcast } from '@/lib/actions/broadcasts';

const formSchema = z.object({
  channel: z.enum(['push', 'email']),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  body: z.string().min(5, 'Body must be at least 5 characters'),
  url: z.string().url('Must be a valid URL (e.g., https://resultguru.co.in/job/xyz)'),
});

type FormValues = z.infer<typeof formSchema>;

export function BroadcastForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: 'push',
      subject: '',
      body: '',
      url: 'https://resultguru.co.in/',
    },
  });

  const channel = watch('channel');

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setSuccess(null);
    
    const channelName = data.channel === 'push' ? 'Push Notification' : 'Email Newsletter';
    if (!window.confirm(`Are you sure you want to send this broadcast? It will instantly notify all active ${channelName} subscribers.`)) {
      return;
    }

    const payload = {
      subject: data.subject,
      body: data.body,
      url: data.url
    };

    const result = data.channel === 'push' 
      ? await sendPushBroadcast(payload)
      : await sendEmailBroadcast(payload);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(`Successfully sent to ${result.data?.sentCount} subscribers. (${result.data?.failedCount} failed)`);
      reset();
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-sm font-medium text-error p-3 bg-error/10 rounded-md">{error}</div>}
      {success && <div className="text-sm font-medium text-success p-3 bg-success/10 rounded-md">{success}</div>}
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Broadcast Channel</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
            channel === 'push' 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-border bg-surface text-foreground hover:bg-background-subtle'
          }`}>
            <input 
              type="radio" 
              value="push" 
              {...register('channel')} 
              className="sr-only" 
            />
            <span className="font-bold text-sm">Push Notification</span>
            <span className="text-xs text-foreground-muted mt-1 text-center">Sends native web push alerts</span>
          </label>
          <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
            channel === 'email' 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-border bg-surface text-foreground hover:bg-background-subtle'
          }`}>
            <input 
              type="radio" 
              value="email" 
              {...register('channel')} 
              className="sr-only" 
            />
            <span className="font-bold text-sm">Email Newsletter</span>
            <span className="text-xs text-foreground-muted mt-1 text-center">Sends email via Resend</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium leading-none">Title (Subject)</label>
        <Input id="subject" {...register('subject')} placeholder="e.g. SSC CGL 2024 Admit Card Out" />
        {errors.subject && <p className="text-sm text-error">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium leading-none">Body Message</label>
        <Input id="body" {...register('body')} placeholder="e.g. Download your admit card now from the official link." />
        {errors.body && <p className="text-sm text-error">{errors.body.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium leading-none">Target URL</label>
        <Input id="url" {...register('url')} placeholder="e.g. https://resultguru.co.in/job/ssc-cgl" />
        {errors.url && <p className="text-sm text-error">{errors.url.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Broadcast
      </Button>
    </form>
  );
}
