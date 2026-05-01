"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Breadcrumbs from "./breadcrumbs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, UserCheck } from "lucide-react";
import { useFinancialStore } from "@/store/financialStore";
import { useProfilePanel } from "./ProfilePanelContext";
import { Progress } from "@/components/ui/progress";
import { getUserFullName } from "@/lib/client-data";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, UserIcon, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth, clearUserProfile } from "@/lib/client-data";

export default function DashboardTopbar() {
  const profileCompletionScore = useFinancialStore(
    (s) => s.profileCompletionScore,
  );
  const user = useFinancialStore((s) => s.user);
  const { open: openProfilePanel } = useProfilePanel();
  const router = useRouter();
  const incomplete = profileCompletionScore < 100;
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayName = getUserFullName(user ?? undefined);
  const userEmail = user?.email ?? "";
  const initials = mounted
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
    : "";

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 h-16">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 ">
        <SidebarTrigger />
        <Breadcrumbs />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">
        {/* Bell / Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative rounded-md p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
              {/* Pulsing dot when profile is incomplete */}
              {incomplete && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500 ring-1 ring-white animate-pulse" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-800">
                Notifications
              </p>
            </div>

            {/* Profile completion notification */}
            {incomplete && (
              <button
                type="button"
                onClick={openProfilePanel}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50/60 transition-colors border-b text-left"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <UserCheck className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    Complete your profile
                  </p>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    Your profile is {profileCompletionScore}% complete. Finish
                    setting up to unlock deeper insights.
                  </p>
                  <Progress value={profileCompletionScore} className="h-1.5" />
                </div>
              </button>
            )}

            {/* Empty state */}
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Bell className="h-7 w-7 text-gray-200" />
              <p className="text-xs text-gray-400">No other notifications</p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User profile dropdown */}
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors text-left">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    {mounted ? displayName : ""}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight">
                    {userEmail}
                  </span>
                </div>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-[#1B1856] text-white text-sm font-semibold">
                    {mounted
                      ? displayName
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">
                    {mounted ? displayName : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/account/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/account/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ll be returned to the sign-in page. Any unsaved changes
                will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loggingOut}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={loggingOut}
                className="bg-destructive hover:bg-destructive/90 text-white min-w-[100px]"
                onClick={async (e) => {
                  e.preventDefault();
                  setLoggingOut(true);
                  try {
                    await fetch("/api/auth/sign-out", { method: "POST" });
                  } catch {
                    // ignore — still clear local state
                  }
                  clearAuth();
                  clearUserProfile();
                  router.replace("/");
                }}
              >
                {loggingOut ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing out…
                  </span>
                ) : (
                  "Sign out"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
