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
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-white border-r border-gray-200 text-gray-700"
    >
      <SidebarHeader className="pt-4 px-3">
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
                      src="https://i.ibb.co/Z6CHCxjJ/Celerey-Logo-light.png"
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
        <SidebarSeparator className="my-3 bg-gray-200" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="relative flex flex-col gap-2 mt-2">
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
                    "relative overflow-hidden rounded-md",
                    "hover:bg-gray-100",
                    "transition-colors",
                    "h-10 px-2",
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
                        className="absolute inset-0 rounded-md bg-white"
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
                          active ? "text-[#160b35]" : "text-white/70",
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
                              active ? "text-[#160b35]" : "text-white/70",
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
      <SidebarSeparator className="my-3 bg-gray-200" />

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
