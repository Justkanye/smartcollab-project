import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PendingInvitations } from "@/components/organizations/pending-invitations";
import { MembersTable } from "./_components/members-table";
import { getUser } from "@/app/actions/auth.actions";
import { createClient } from "@/lib/superbase.server";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";

export default async function OrganizationMembersPage({
  params,
}: {
  params: { organizationId: string };
}) {
  const supabase = await createClient();
  const { data: user } = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user is a member of the organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", params.organizationId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    redirect("/");
  }

  const canInvite = ["owner", "admin"].includes(membership.role);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Team Members</h1>
          <p className='text-muted-foreground'>
            Manage your organization members and their permissions
          </p>
        </div>
        {canInvite && (
          <InviteMemberDialog organizationId={params.organizationId}>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Invite Member
            </Button>
          </InviteMemberDialog>
        )}
      </div>

      <MembersTable organizationId={params.organizationId} />

      {canInvite && (
        <div className='mt-8'>
          <PendingInvitations organizationId={params.organizationId} />
        </div>
      )}
    </div>
  );
}
