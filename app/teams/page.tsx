import { getTeams } from "@/app/actions/team.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TeamCard } from "@/components/teams/team-card";
import { getCurrentOrganization } from "@/app/actions/organization.actions";

export default async function TeamsPage() {
  const { data: currentOrganization } = await getCurrentOrganization();

  if (!currentOrganization) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Organization Selected</h2>
          <p className="text-muted-foreground">
            Please select or create an organization to manage teams.
          </p>
        </div>
      </div>
    );
  }

  const { data: teams, error } = await getTeams(currentOrganization.id);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Error Loading Teams</h2>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage your organization's teams and members
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No teams yet</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Get started by creating a new team
          </p>
          <Button asChild>
            <Link href="/teams/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
