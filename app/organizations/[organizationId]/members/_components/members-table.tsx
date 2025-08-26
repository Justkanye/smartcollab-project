'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, MoreVertical, User, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  user_id: string;
  email: string;
  role: string;
  status: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function MembersTable({ organizationId }: { organizationId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const router = useRouter();

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.members || []);
      setCurrentUserRole(data.currentUserRole || '');
      setCurrentUserId(data.currentUserId || '');
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [memberId]: true }));
      
      const response = await fetch(
        `/api/organizations/${organizationId}/members/${memberId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Update local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      toast.success('Member role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsUpdating(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail}?`)) {
      return;
    }

    try {
      setIsUpdating(prev => ({ ...prev, [memberId]: true }));
      
      const response = await fetch(
        `/api/organizations/${organizationId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      toast.success('Member removed');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setIsUpdating(prev => ({ ...prev, [memberId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <User className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-medium">No members found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by inviting your first team member
          </p>
        </div>
      </div>
    );
  }

  const canManageMembers = ['owner', 'admin'].includes(currentUserRole);
  const isOwner = currentUserRole === 'owner';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const memberName = member.user?.full_name || member.email.split('@')[0];
            const memberEmail = member.user?.email || member.email;
            const memberAvatar = member.user?.avatar_url;
            const isUpdatingMember = isUpdating[member.id];
            
            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      {memberAvatar ? (
                        <AvatarImage src={memberAvatar} alt={memberName} />
                      ) : (
                        <AvatarFallback>
                          {memberName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">{memberName}</div>
                      <div className="text-sm text-muted-foreground">
                        {memberEmail}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isCurrentUser ? (
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  ) : canManageMembers ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={isUpdatingMember || (member.role === 'owner' && !isOwner)}
                      className="bg-background border rounded px-2 py-1 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      {isOwner && <option value="owner">Owner</option>}
                    </select>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                    {member.status === 'active' ? 'Active' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!isCurrentUser && canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isUpdatingMember || (member.role === 'owner' && !isOwner)}
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id, memberEmail)}
                          className="text-destructive focus:text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
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
  );
}
