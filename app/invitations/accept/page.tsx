'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError('No invitation token provided');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept invitation');
        }

        setStatus('success');
        setRedirectTo(data.redirectTo || '/');
        
        // Show success toast
        toast({
          title: 'Invitation accepted!',
          description: 'You have been successfully added to the organization/team.',
        });

        // Redirect after a short delay
        setTimeout(() => {
          router.push(data.redirectTo || '/');
        }, 2000);
      } catch (err) {
        console.error('Error accepting invitation:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        toast({
          title: 'Error accepting invitation',
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    };

    acceptInvitation();
  }, [searchParams, router, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-center shadow-sm">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Accepting Invitation</h1>
            <p className="text-muted-foreground">Please wait while we process your invitation...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Invitation Accepted!</h1>
            <p className="text-muted-foreground">You have been successfully added to the organization/team.</p>
            {redirectTo && (
              <p className="text-sm text-muted-foreground">
                Redirecting you in a few seconds...
              </p>
            )}
            <Button 
              onClick={() => router.push(redirectTo || '/')}
              className="mt-4"
            >
              Go to {redirectTo?.includes('/teams/') ? 'Team' : 'Organization'}
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Invitation Error</h1>
            <p className="text-muted-foreground">
              {error || 'There was an error processing your invitation.'}
            </p>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="mt-4"
            >
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
