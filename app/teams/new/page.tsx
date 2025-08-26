import { redirect } from "next/navigation";
import { createClient } from "@/lib/superbase.server";
import { TeamForm } from "@/components/teams/team-form";
import { cookies } from "next/headers";

export default async function NewTeamPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  // Get the current organization from the cookie
  const cookieStore = cookies();
  const currentOrgId = cookieStore.get("current_organization")?.value;

  if (!currentOrgId) {
    redirect("/");
  }

  const handleCreateTeam = async (formData: FormData) => {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    const { createTeam } = await import("@/app/actions/team.actions");
    const { data: team, error } = await createTeam({
      name,
      description: description || undefined,
      organization_id: currentOrgId,
    });
    
    if (error) {
      console.error("Error creating team:", error);
      return { error };
    }
    
    redirect(`/teams/${team?.id}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create a new team</h1>
        <p className="text-muted-foreground">
          Set up a new team to organize your projects and members
        </p>
      </div>
      
      <TeamForm 
        onSubmit={handleCreateTeam}
        submitButtonText="Create Team"
        defaultValues={{
          name: "",
          description: "",
        }}
      />
    </div>
  );
}
