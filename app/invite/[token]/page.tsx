import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/superbase.server";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/app/actions/invitation.actions";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not logged in, redirect to sign in with the token
  if (!session) {
    redirect(`/signin?invite_token=${token}`);
  }

  // Process the invitation
  const { success, error } = await acceptInvitation(token);

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <div className='w-full max-w-md p-8 space-y-4 text-center border rounded-lg'>
          <h1 className='text-2xl font-bold'>Invalid Invitation</h1>
          <p className='text-muted-foreground'>
            {error || "This invitation is invalid or has expired."}
          </p>
          <Button asChild className='w-full mt-4'>
            <a href='/'>Go to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  // If successful, redirect to the appropriate page
  if (success) {
    redirect("/teams");
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-md p-8 space-y-4 text-center border rounded-lg'>
        <h1 className='text-2xl font-bold'>Accepting Invitation</h1>
        <p className='text-muted-foreground'>Processing your invitation...</p>
      </div>
    </div>
  );
}
