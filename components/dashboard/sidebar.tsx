"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  LogOut,
  MoreVertical,
  Settings,
  UserIcon,
} from "lucide-react";
import { mockUser, getUserFullName } from "@/lib/user-data";

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
} from "@fortawesome/free-solid-svg-icons";

const nav = [
  { label: "Overview", href: "/dashboard", icon: faChartPie },
  { label: "Goals & Planning", href: "/dashboard/goals", icon: faBullseye },
  { label: "Assets", href: "/dashboard/assets", icon: faBriefcase },
  { label: "Properties", href: "/dashboard/properties", icon: faHouse },
  { label: "Insurance", href: "/dashboard/insurance", icon: faShieldHalved },
  { label: "Cash Flow", href: "/dashboard/cash-flow", icon: faMoneyBillWave },
  { label: "Retirement", href: "/dashboard/retirement", icon: faUmbrellaBeach },
  { label: "Celerey Insights", href: "/dashboard/ai", icon: faBrain },
  { label: "Concierge", href: "/dashboard/concierge", icon: faBellConcierge },
  // { label: "Documents", href: "/dashboard/documents", icon: faFileLines },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="pt-2">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-md">
          <div className="flex w-full justify-left">
            <div className="relative h-14 w-30">
              <AnimatePresence mode="wait" initial={false}>
                {collapsed ? (
                  <motion.div
                    key="symbol"
                    initial={{
                      opacity: 0,
                      scale: 0.92,
                      x: -6,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      x: 6,
                      filter: "blur(4px)",
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                  >
                    <Image
                      src="/celerey_symbol_dark.png"
                      alt="Celerey"
                      width={50}
                      height={50}
                      className="rounded-lg"
                      priority
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="full"
                    initial={{
                      opacity: 0,
                      scale: 0.98,
                      x: -6,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      x: 6,
                      filter: "blur(4px)",
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                  >
                    <Image
                      src="https://i.ibb.co/PGVKSsV1/image.png"
                      alt="Celerey Logo"
                      width={100}
                      height={50}
                      className="rounded-xl p-2"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Link>
        <SidebarSeparator className="my-2 bg-gray-200 " />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="relative">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href} className="relative">
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className={[
                    // remove the hard active bg so the animated pill is the “bg”
                    "relative overflow-hidden",
                    "hover:bg-sidebar-accent/60",
                    "transition-colors",
                    // make spacing consistent to avoid tiny reflows
                    "h-10",
                  ].join(" ")}
                >
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-2"
                  >
                    {/* Animated active background */}
                    {active ? (
                      <motion.span
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-[#1B1856]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 32,
                          mass: 0.6,
                        }}
                      />
                    ) : null}

                    {/* Foreground content */}
                    <span className="relative z-10 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={[
                          "h-4 w-4 opacity-90",
                          active ? "text-white" : "text-foreground",
                        ].join(" ")}
                        fixedWidth
                      />

                      {/* Smooth label fade when collapsing (prevents “snap”) */}
                      <AnimatePresence initial={false}>
                        {!collapsed ? (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.14, ease: "easeOut" }}
                            className={[
                              active ? "text-white" : "text-foreground",
                              "whitespace-nowrap",
                            ].join(" ")}
                          >
                            {item.label}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Support">
              <Link href="/admin/support" className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="h-4 w-4"
                  fixedWidth
                />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
