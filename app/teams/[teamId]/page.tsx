import { notFound } from "next/navigation";
import { getTeam } from "@/app/actions/team.actions";
import { TeamDetailsHeader } from "./_components/team-details-header";
import { TeamStats } from "./_components/team-stats";
import { TeamProjects } from "./_components/team-projects";
import { TeamActivity } from "./_components/team-activity";

interface TeamPageProps {
  params: { teamId: string };
}

export default async function TeamPage({ params }: TeamPageProps) {
  // Get the team data
  const { data: team, error } = await getTeam(params.teamId);

  if (error || !team) {
    notFound();
  }

  // Mock data - replace with actual data fetching
  const stats = {
    memberCount: 8,
    projectCount: 5,
    completedTasks: 124,
    totalTasks: 187,
    activeProjects: 3,
    onTrackPercentage: 78,
  };

  return (
    <div className='flex-1 p-4 md:p-8 pt-6 space-y-6'>
      <TeamDetailsHeader
        team={team}
        memberCount={stats.memberCount}
        projectCount={stats.projectCount}
      />

      <TeamStats
        memberCount={stats.memberCount}
        projectCount={stats.projectCount}
        completedTasks={stats.completedTasks}
        totalTasks={stats.totalTasks}
        activeProjects={stats.activeProjects}
        onTrackPercentage={stats.onTrackPercentage}
      />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='md:col-span-2'>
          <TeamProjects teamId={team.id} />
        </div>
        <div className='lg:col-span-1'>
          <TeamActivity />
        </div>
      </div>
    </div>
  );
}
