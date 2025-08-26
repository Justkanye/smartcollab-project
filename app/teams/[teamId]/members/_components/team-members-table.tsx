"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, MoreVertical, User, X } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function TeamMembersTable({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();

  // Retry function for error recovery
  const retryFetch = () => {
    setError(null);
    fetchTeamMembers();
  };

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/teams/${teamId}/members`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch team members");
      }

      const data = await response.json();
      setMembers(data.members || []);
      setCurrentUserRole(data.currentUserRole || "");
      setCurrentUserId(data.currentUserId || "");
    } catch (err) {
      console.error("Error fetching team members:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load team members";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [teamId]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [memberId]: true }));

      const response = await fetch(
        `/api/teams/${teamId}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update role");
      }

      // Update local state
      setMembers(
        members.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );

      toast.success("Member role updated");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    // Use a more user-friendly confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberEmail} from the team? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsUpdating(prev => ({ ...prev, [memberId]: true }));

      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to remove member");
      }

      // Update local state
      setMembers(members.filter(member => member.id !== memberId));

      toast.success("Member removed", {
        description: `${memberEmail} has been removed from the team.`,
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Error removing member", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [memberId]: false }));
    }
  };

  if (isLoading) {
    return <Loading text='Loading team members...' />;
  }

  if (error) {
    return (
      <div className='rounded-md border p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error loading team members</AlertTitle>
          <AlertDescription className='space-y-4'>
            <p>{error}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={retryFetch}
              className='mt-2'
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center'>
        <div className='flex flex-col items-center justify-center space-y-2'>
          <User className='h-8 w-8 text-muted-foreground' />
          <h3 className='text-lg font-medium'>No team members found</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Get started by inviting team members
          </p>
          <Button
            variant='outline'
            onClick={() => router.push(`/teams/${teamId}/members/invite`)}
          >
            Invite Team Members
          </Button>
        </div>
      </div>
    );
  }

  const canManageMembers = ["owner", "admin"].includes(currentUserRole);
  const isOwner = currentUserRole === "owner";

  return (
    <ErrorBoundary
      fallback={
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            There was an error displaying the team members. Please try again.
          </AlertDescription>
        </Alert>
      }
    >
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => {
              const isCurrentUser = member.user_id === currentUserId;
              const memberName =
                member.user?.full_name || member.email.split("@")[0];
              const memberEmail = member.user?.email || member.email;
              const memberAvatar = member.user?.avatar_url;
              const isUpdatingMember = isUpdating[member.id];

              return (
                <TableRow key={member.id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-8 w-8'>
                        {memberAvatar ? (
                          <AvatarImage src={memberAvatar} alt={memberName} />
                        ) : (
                          <AvatarFallback>
                            {memberName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className='font-medium'>{memberName}</div>
                        <div className='text-sm text-muted-foreground'>
                          {memberEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isCurrentUser ? (
                      <Badge variant='outline' className='capitalize'>
                        {member.role}
                      </Badge>
                    ) : canManageMembers ? (
                      <select
                        value={member.role}
                        onChange={e =>
                          handleRoleChange(member.id, e.target.value)
                        }
                        disabled={
                          isUpdatingMember ||
                          (member.role === "owner" && !isOwner)
                        }
                        className='bg-background border rounded px-2 py-1 text-sm'
                      >
                        {isOwner && <option value='owner'>Owner</option>}
                        <option value='admin'>Admin</option>
                        <option value='member'>Member</option>
                      </select>
                    ) : (
                      <Badge variant='outline' className='capitalize'>
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUser && canManageMembers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            disabled={
                              isUpdatingMember ||
                              (member.role === "owner" && !isOwner)
                            }
                            className='h-8 w-8 p-0'
                          >
                            <MoreVertical className='h-4 w-4' />
                            <span className='sr-only'>More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRemoveMember(member.id, memberEmail)
                            }
                            className='text-destructive focus:text-destructive'
                          >
                            <X className='mr-2 h-4 w-4' />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ErrorBoundary>
  );
}
