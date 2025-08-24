"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme = "system" } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Sun
            className={cn(
              "h-[1.2rem] w-[1.2rem]",
              theme !== "light" && "hidden"
            )}
          />
          <Moon
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem]",
              theme !== "dark" && "hidden"
            )}
          />
          <Monitor
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem]",
              theme !== "system" && "hidden"
            )}
          />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className='mr-2 h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className='mr-2 h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className='mr-2 h-4 w-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
