import { redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/team-form";
import { getCurrentOrganization } from "@/app/actions/organization.actions";

export default async function NewTeamPage() {
  const { data: currentOrganization } = await getCurrentOrganization();

  if (!currentOrganization) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <div className='text-center space-y-4'>
          <h2 className='text-2xl font-bold'>No Organization Selected</h2>
          <p className='text-muted-foreground'>
            Please select or create an organization to create a team.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateTeam = async (formData: FormData) => {
    "use server";

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const { createTeam } = await import("@/app/actions/team.actions");
    const { data: team, error } = await createTeam({
      name,
      description: description || undefined,
      organization_id: currentOrganization.id,
    });

    if (error) {
      console.error("Error creating team:", error);
      return { error };
    }

    redirect(`/teams/${team?.id}`);
  };

  return (
    <div className='flex-1 p-4 md:p-8 pt-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Create a new team</h1>
        <p className='text-muted-foreground'>
          Set up a new team to organize your projects and members
        </p>
      </div>

      <TeamForm
        onSubmit={handleCreateTeam}
        submitButtonText='Create Team'
        defaultValues={{
          name: "",
          description: "",
        }}
      />
    </div>
  );
}
