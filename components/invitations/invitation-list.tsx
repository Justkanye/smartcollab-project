'use client';

import { useEffect, useState } from "react";
import { getPendingInvitations } from "@/app/actions/invitation.actions";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/app/actions/invitation.actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";

export function InvitationList() {
  const [invitations, setInvitations] = useState<{
    organizations: any[];
    teams: any[];
  }>({ organizations: [], teams: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data } = await getPendingInvitations();
      if (data) {
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (type: 'organization' | 'team', id: string, token: string) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      const { success, error } = await acceptInvitation(token);
      
      if (success) {
        toast({
          title: "Success",
          description: `You've joined the ${type}!`,
        });
        await loadInvitations();
      } else {
        throw new Error(error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error(`Error accepting ${type} invitation:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDecline = async (type: 'organization' | 'team', id: string) => {
    // TODO: Implement decline functionality
    toast({
      title: "Invitation Declined",
      description: `You've declined the ${type} invitation.`,
    });
    await loadInvitations();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const totalInvitations = invitations.organizations.length + invitations.teams.length;
  
  if (totalInvitations === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>You have {totalInvitations} pending invitation(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.organizations.map((invite) => (
          <div key={`org-${invite.id}`} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Organization: {invite.organizations?.name}</div>
              <div className="text-sm text-muted-foreground">Role: {invite.role}</div>
              <div className="text-xs text-muted-foreground">
                Invited by: {invite.invited_by}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDecline('organization', invite.id)}
                disabled={processing[invite.id]}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleAccept('organization', invite.id, invite.token)}
                disabled={processing[invite.id]}
              >
                {processing[invite.id] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Accept
              </Button>
            </div>
          </div>
        ))}

        {invitations.teams.map((invite) => (
          <div key={`team-${invite.id}`} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Team: {invite.teams?.name}</div>
              <div className="text-sm text-muted-foreground">
                Organization: {invite.teams?.organizations?.name}
              </div>
              <div className="text-sm text-muted-foreground">Role: {invite.role}</div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDecline('team', invite.id)}
                disabled={processing[invite.id]}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => handleAccept('team', invite.id, invite.token)}
                disabled={processing[invite.id]}
              >
                {processing[invite.id] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
