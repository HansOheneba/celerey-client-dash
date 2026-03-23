"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Breadcrumbs from "./breadcrumbs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";

export default function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-3">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Breadcrumbs />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative rounded-md p-2 hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Bell className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                No notifications
              </p>
              <p className="text-xs text-gray-400">
                You&apos;re all caught up!
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
