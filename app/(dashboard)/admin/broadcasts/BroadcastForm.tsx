'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';
import { sendPushBroadcast } from '@/lib/actions/broadcasts';

const formSchema = z.object({
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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      body: '',
      url: 'https://resultguru.co.in/',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setSuccess(null);
    
    // Quick confirmation
    if (!window.confirm(`Are you sure you want to send this broadcast? It will instantly notify all subscribers.`)) {
      return;
    }

    const result = await sendPushBroadcast(data);

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
