import { notFound } from "next/navigation";
import { getTeamMembers, getTeam } from "@/app/actions/team.actions";
import { TeamMemberList } from "@/components/teams/team-member-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/app/actions/auth.actions";

export default async function TeamMembersPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { data: user } = await getUser();

  if (!user) {
    notFound();
  }

  // Get the team and members in parallel
  const [teamResult, membersResult] = await Promise.all([
    getTeam(params.teamId),
    getTeamMembers(params.teamId),
  ]);

  if (!teamResult.data) {
    notFound();
  }

  const team = teamResult.data;
  const members = membersResult.data || [];
  const error = teamResult.error || membersResult.error;

  return (
    <div className='container mx-auto py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {team.name} Team
          </h1>
          <p className='text-muted-foreground'>
            Manage team members and their permissions
          </p>
        </div>
        <Button asChild>
          <Link href={`/teams/${team.id}/members/invite`}>
            <Plus className='mr-2 h-4 w-4' />
            Add Member
          </Link>
        </Button>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-destructive/10 text-destructive rounded-md'>
          {error}
        </div>
      )}

      <TeamMemberList
        teamId={team.id}
        initialMembers={members}
        currentUserId={user.id}
      />
    </div>
  );
}
