import { Team } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Calendar, Folder } from "lucide-react";
import Link from "next/link";

interface TeamDetailsHeaderProps {
  team: Team;
  memberCount: number;
  projectCount: number;
}

export function TeamDetailsHeader({
  team,
  memberCount,
  projectCount,
}: TeamDetailsHeaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`/team-avatars/${team.id}.png`} alt={team.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {team.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{team.name}</h1>
                {team.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    Default Team
                  </Badge>
                )}
              </div>
              
              {team.description && (
                <p className="text-muted-foreground">{team.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Folder className="h-4 w-4" />
                  <span>{projectCount} projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/teams/${team.id}/members`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/teams/${team.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Team Settings
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
