import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/superbase.server";
import { getTeam } from "@/app/actions/team.actions";

export default async function TeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  // Get the team data
  const { data: team, error } = await getTeam(params.teamId);

  if (!team || error) {
    notFound();
  }

  // Redirect to the members page by default
  redirect(`/teams/${params.teamId}/members`);
}
