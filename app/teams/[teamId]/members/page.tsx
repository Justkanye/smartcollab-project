import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTeam } from '@/app/actions/team.actions';
import { getUser } from '@/app/actions/auth.actions';
import { TeamMembersManager } from './_components/team-members-manager';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loading } from '@/components/ui/loading';

// Separate component for the main content to handle loading states
async function TeamMembersContent({ teamId }: { teamId: string }) {
  const { data: user } = await getUser();

  if (!user) {
    notFound();
  }

  // Get the team
  const teamResult = await getTeam(teamId);

  if (!teamResult.data) {
    notFound();
  }

  return <TeamMembersManager teamId={teamId} />;
}

export default function TeamMembersPage({
  params,
}: {
  params: { teamId: string };
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ErrorBoundary
        fallback={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Team Members</h1>
            <div className="rounded-md border border-destructive p-4">
              <p className="text-destructive">
                Failed to load team members. Please try again later.
              </p>
            </div>
          </div>
        }
      >
        <Suspense fallback={<Loading text="Loading team information..." />}>
          <TeamMembersContent teamId={params.teamId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
