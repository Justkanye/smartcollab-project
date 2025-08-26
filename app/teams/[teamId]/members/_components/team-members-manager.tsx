'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InviteMemberDialog } from '@/components/teams/invite-member-dialog';
import { TeamMembersTable } from './team-members-table';

export function TeamMembersManager({ teamId }: { teamId: string }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <TeamMembersTable teamId={teamId} />

      <InviteMemberDialog
        teamId={teamId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={() => {
          // Refresh the members list after a successful invite
          router.refresh();
        }}
      />
    </div>
  );
}
