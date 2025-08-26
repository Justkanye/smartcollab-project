"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserX, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { TeamMember } from "@/types";
import { updateTeamMember, removeTeamMember } from "@/app/actions/team.actions";
import { toast } from "sonner";

type TeamRole = "admin" | "member" | "viewer";

type TeamMemberListProps = {
  teamId: string;
  initialMembers: TeamMember[];
  currentUserId: string;
};

export function TeamMemberList({
  teamId,
  initialMembers,
  currentUserId,
}: TeamMemberListProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Update local state if initialMembers changes
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleRoleChange = async (userId: string, newRole: TeamRole) => {
    try {
      setIsLoading((prev) => ({ ...prev, [userId]: true }));
      
      const { data: updatedMember, error } = await updateTeamMember(
        teamId,
        userId,
        { role: newRole }
      );

      if (error) {
        toast.error(`Failed to update role: ${error}`);
        return;
      }

      setMembers((prev) =>
        prev.map((member) =>
          member.user_id === userId && updatedMember
            ? { ...member, ...updatedMember }
            : member
        )
      );
      
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An error occurred while updating the role");
    } finally {
      setIsLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    try {
      setIsLoading((prev) => ({ ...prev, [userId]: true }));
      
      const { error } = await removeTeamMember(teamId, userId);

      if (error) {
        toast.error(`Failed to remove member: ${error}`);
        return;
      }

      setMembers((prev) => prev.filter((member) => member.user_id !== userId));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("An error occurred while removing the member");
    } finally {
      setIsLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case "member":
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No members in this team yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Team Members ({members.length})</h3>
        <div className="space-y-3">
          {members.map((member) => {
            const user = member.user;
            const isCurrentUser = user?.id === currentUserId;
            const isOwner = member.role === "owner";
            const isAdmin = member.role === "admin";
            const canEdit = isOwner || (isAdmin && member.role !== "owner");
            
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-background rounded-md border"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user?.full_name || user?.email || "Unknown User"}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {getRoleIcon(member.role)}
                    <span>{getRoleLabel(member.role)}</span>
                  </div>

                  {!isOwner && canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isLoading[member.user_id]}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-medium">
                          Change Role
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(member.user_id, "admin")
                          }
                          disabled={isLoading[member.user_id]}
                          className={member.role === "admin" ? "bg-muted" : ""}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
                          Admin
                          {member.role === "admin" && (
                            <span className="ml-auto">✓</span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(member.user_id, "member")
                          }
                          disabled={isLoading[member.user_id]}
                          className={member.role === "member" ? "bg-muted" : ""}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                          Member
                          {member.role === "member" && (
                            <span className="ml-auto">✓</span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(member.user_id, "viewer")
                          }
                          disabled={isLoading[member.user_id]}
                          className={member.role === "viewer" ? "bg-muted" : ""}
                        >
                          <Shield className="mr-2 h-4 w-4 text-gray-500" />
                          Viewer
                          {member.role === "viewer" && (
                            <span className="ml-auto">✓</span>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() =>
                            handleRemoveMember(
                              member.user_id,
                              user?.full_name || user?.email || "this user"
                            )
                          }
                          disabled={isLoading[member.user_id]}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove from team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
