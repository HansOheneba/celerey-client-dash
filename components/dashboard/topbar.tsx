"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Breadcrumbs from "./breadcrumbs";
import { personalData } from "@/lib/client-data";
import { mockUser, getUserFullName } from "@/lib/client-data";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { ChevronDown, Settings, LogOut, UserIcon } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function DashboardTopbar() {
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-3 shadow-md">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Breadcrumbs />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#1B1856] text-white text-xs">
                  {getUserFullName(mockUser)
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-medium">
                {getUserFullName(mockUser)}
              </span>

              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {getUserFullName(mockUser)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mockUser.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a
                  href="/dashboard/account/profile"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <a
                  href="/dashboard/account/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => {
                console.log("sign out");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
