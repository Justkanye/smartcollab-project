import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Team } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Users, Settings, Trash2 } from "lucide-react";
import { deleteTeam } from "@/app/actions/team.actions";

type TeamCardProps = {
  team: Team;
};

export function TeamCard({ team }: TeamCardProps) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      const { error } = await deleteTeam(team.id);
      if (error) {
        console.error("Error deleting team:", error);
        // TODO: Show error toast
      }
      // The page will revalidate due to the revalidatePath in the server action
    }
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/team-avatars/${team.id}.png`} alt={team.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {team.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{team.name}</h3>
            <p className="text-sm text-muted-foreground">
              {team.member_count || 0} members
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/teams/${team.id}/members`} className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>View Members</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/teams/${team.id}/settings`} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Team Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Team</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {team.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {team.description}
        </p>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {/* Placeholder for member avatars */}
          {[1, 2, 3].map((i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">U{i}</AvatarFallback>
            </Avatar>
          ))}
          {team.member_count > 3 && (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-background">
              +{team.member_count - 3}
            </div>
          )}
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/teams/${team.id}/members`}>
            Manage
          </Link>
        </Button>
      </div>
      
      {team.is_default && (
        <div className="mt-3">
          <Badge variant="secondary">Default Team</Badge>
        </div>
      )}
    </div>
  );
}
