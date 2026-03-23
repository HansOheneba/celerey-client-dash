"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import { motion, AnimatePresence } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faBullseye,
  faBriefcase,
  faHouse,
  faShieldHalved,
  faMoneyBillWave,
  faUmbrellaBeach,
  faBrain,
  faBellConcierge,
  faHeadset,
  faScaleUnbalanced,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";

import { useFinancialStore } from "@/store/financialStore";
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
import { getUserFullName } from "@/lib/client-data";
import { useEffect, useState } from "react";

const nav = [
  { label: "Overview", href: "/dashboard", icon: faChartPie },
  { label: "Goals & Planning", href: "/dashboard/goals", icon: faBullseye },
  { label: "Assets", href: "/dashboard/assets", icon: faBriefcase },
  { label: "Properties", href: "/dashboard/properties", icon: faHouse },
  { label: "Insurance", href: "/dashboard/insurance", icon: faShieldHalved },
  { label: "Cash Flow", href: "/dashboard/cash-flow", icon: faMoneyBillWave },
  {
    label: "Liabilities",
    href: "/dashboard/liabilities",
    icon: faScaleUnbalanced,
  },
  { label: "Retirement", href: "/dashboard/retirement", icon: faUmbrellaBeach },
  { label: "Legacy", href: "/dashboard/legacy", icon: faScroll },
  { label: "Celerey Insights", href: "/dashboard/ai", icon: faBrain },
  { label: "Concierge", href: "/dashboard/concierge", icon: faBellConcierge },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const user = useFinancialStore((s) => s.user);
  const displayName = getUserFullName(user ?? undefined);
  const userEmail = user?.email ?? "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const profileCompletionScore = useFinancialStore(
    (s) => s.profileCompletionScore,
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-white border-r border-gray-200 text-gray-700"
    >
      {/* ── Header ── */}
      <SidebarHeader className="px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-md px-2 hover:bg-gray-50 transition-colors text-left">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-[#1B1856] text-white text-xs">
                  {mounted
                    ? displayName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                    : ""}
                </AvatarFallback>
              </Avatar>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="profile-text"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.14 }}
                    className="flex flex-col min-w-0 flex-1"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {mounted ? displayName : ""}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="chevron"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}
                    className="ml-auto shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {mounted ? displayName : ""}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
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

      </SidebarHeader>
        <SidebarSeparator className="my-2 bg-gray-200" />

      {/* ── Nav ── */}
      <SidebarContent className="px-2">
        <SidebarMenu className="flex flex-col gap-1.5 mt-2">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className={`
                    relative rounded-md h-10 px-3
                    transition-colors
                    ${active ? "bg-gray-100" : "hover:bg-gray-50"}
                  `}
                >
                  <Link className="flex items-center gap-3" href={item.href}>
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={`
                        h-4 w-4
                        ${
                          active
                            ? "text-[#160b35]"
                            : "text-gray-400"
                        }
                      `}
                      fixedWidth
                    />

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.14 }}
                          className={`
                            text-sm whitespace-nowrap
                            ${
                              active
                                ? "text-[#160b35] font-medium"
                                : "text-gray-600"
                            }
                          `}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="my-3 bg-gray-200" />

      {/* ── Profile Completion Widget ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="profile-completion"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-3 pb-2"
          >
            <button
              type="button"
              onClick={() => router.push("/dashboard/profile/setup")}
              className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-2.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-700">
                  Your profile is{" "}
                  <span className="font-semibold text-[#160b35]">
                    {profileCompletionScore}%
                  </span>{" "}
                  complete
                </p>
                <span className="text-xs tabular-nums text-gray-500">
                  {profileCompletionScore}/100
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletionScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#160b35]"
                />
              </div>
              {profileCompletionScore < 100 && (
                <p className="text-[11px] text-gray-500 leading-snug">
                  Complete your profile to get the most out of Celerey
                </p>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Support"
              className="hover:bg-gray-50"
            >
              <Link
                href="/admin/support"
                className="flex items-center gap-3 px-3"
              >
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="h-4 w-4 text-gray-400"
                  fixedWidth
                />
                <span className="text-sm text-gray-600">Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
