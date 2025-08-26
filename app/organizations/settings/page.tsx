"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Users,
  UserPlus,
  MoreHorizontal,
  Crown,
  Shield,
  Eye,
  Trash2,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganizationMembers } from "@/hooks/use-organizations";
import { useToast } from "@/hooks/use-toast";
import { ORGANIZATION_ROLES } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { useStore } from "@/hooks/use-store";
import { useShallow } from "zustand/shallow";
import { updateOrganization } from "@/app/actions/organization.actions";

export default function OrganizationSettings() {
  const [currentOrganization, isAdmin] = useStore(
    useShallow(state => [
      state.organizations.find(org => org.id === state.currentOrganizationId),
      true,
    ])
  );
  const { members, loading, inviteMember, updateMemberRole, removeMember } =
    useOrganizationMembers(currentOrganization?.id);
  const { toast } = useToast();

  const [orgData, setOrgData] = useState({
    name: currentOrganization?.name || "",
    description: currentOrganization?.description || "",
    logo_url: (currentOrganization as any)?.logo_url || "",
  });

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
  });

  const handleUpdateOrganization = async () => {
    if (!currentOrganization) return;

    const { error } = await updateOrganization(currentOrganization.id, orgData);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    }
  };

  const handleInviteMember = async () => {
    if (!inviteData.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await inviteMember(inviteData.email, inviteData.role);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setInviteData({ email: "", role: "member" });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await updateMemberRole(userId, newRole);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await removeMember(userId);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className='h-4 w-4 text-yellow-600' />;
      case "member":
        return <Shield className='h-4 w-4 text-blue-600' />;
      case "guest":
        return <Eye className='h-4 w-4 text-gray-600' />;
      default:
        return <Shield className='h-4 w-4' />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "member":
        return "secondary";
      case "guest":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (!currentOrganization) {
    return (
      <div className='flex flex-col min-h-screen'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          {/* <SidebarTrigger className='-ml-1' /> */}
          <div>
            <h1 className='text-xl font-semibold'>Organization Settings</h1>
            <p className='text-sm text-muted-foreground'>
              No organization selected
            </p>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-muted-foreground'>
            Please select an organization first.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='flex flex-col min-h-screen'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          {/* <SidebarTrigger className='-ml-1' /> */}
          <div>
            <h1 className='text-xl font-semibold'>Organization Settings</h1>
            <p className='text-sm text-muted-foreground'>Access denied</p>
          </div>
        </header>
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-muted-foreground'>
            You don't have permission to access organization settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        {/* <SidebarTrigger className='-ml-1' /> */}
        <div className='flex flex-1 items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold'>Organization Settings</h1>
            <p className='text-sm text-muted-foreground'>
              Manage {currentOrganization.name} settings and members
            </p>
          </div>
        </div>
      </header>

      <div className='flex-1 p-6'>
        <Tabs defaultValue='general' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='general'>
              <Settings className='mr-2 h-4 w-4' />
              General
            </TabsTrigger>
            <TabsTrigger value='members'>
              <Users className='mr-2 h-4 w-4' />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Organization Name</Label>
                    <Input
                      id='name'
                      value={orgData.name}
                      onChange={e =>
                        setOrgData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder='Enter organization name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='logo'>Logo URL</Label>
                    <Input
                      id='logo'
                      value={orgData.logo_url}
                      onChange={e =>
                        setOrgData(prev => ({
                          ...prev,
                          logo_url: e.target.value,
                        }))
                      }
                      placeholder='https://example.com/logo.png'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    value={orgData.description}
                    onChange={e =>
                      setOrgData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder='Describe your organization'
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdateOrganization}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  Overview of what each role can do in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {Object.entries(ORGANIZATION_ROLES).map(([key, role]) => (
                    <div
                      key={key}
                      className='flex items-start gap-3 p-4 border rounded-lg'
                    >
                      {getRoleIcon(key)}
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-medium'>{role.name}</h4>
                          <Badge variant={getRoleBadgeVariant(key)}>
                            {key}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mb-2'>
                          {role.description}
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {role.permissions.map(permission => (
                            <Badge
                              key={permission}
                              variant='outline'
                              className='text-xs'
                            >
                              {permission.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='members' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Organization Members</CardTitle>
                    <CardDescription>
                      Manage who has access to your organization
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your organization
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='email'>Email Address</Label>
                          <Input
                            id='email'
                            type='email'
                            value={inviteData.email}
                            onChange={e =>
                              setInviteData(prev => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder='colleague@company.com'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='role'>Role</Label>
                          <Select
                            value={inviteData.role}
                            onValueChange={value =>
                              setInviteData(prev => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORGANIZATION_ROLES).map(
                                ([key, role]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className='flex items-center gap-2'>
                                      {getRoleIcon(key)}
                                      <span>{role.name}</span>
                                    </div>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleInviteMember}>
                          <Mail className='mr-2 h-4 w-4' />
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className='w-[100px]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={member.profiles?.avatar_url || ""}
                              />
                              <AvatarFallback>
                                {member.profiles?.full_name?.charAt(0) ||
                                  member.profiles?.email?.charAt(0) ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium'>
                                {member.profiles?.full_name || "Unknown User"}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                {member.profiles?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getRoleIcon(member.role)}
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {ORGANIZATION_ROLES[
                                member.role as keyof typeof ORGANIZATION_ROLES
                              ]?.name || member.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.joined_at
                            ? formatDistanceToNow(new Date(member.joined_at), {
                                addSuffix: true,
                              })
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {Object.entries(ORGANIZATION_ROLES).map(
                                ([key, role]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() =>
                                      handleUpdateRole(member.user_id, key)
                                    }
                                    disabled={member.role === key}
                                  >
                                    <div className='flex items-center gap-2'>
                                      {getRoleIcon(key)}
                                      <span>Make {role.name}</span>
                                    </div>
                                  </DropdownMenuItem>
                                )
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRemoveMember(member.user_id)
                                }
                                className='text-destructive'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
