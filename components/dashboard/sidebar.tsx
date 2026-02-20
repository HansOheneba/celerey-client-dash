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
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, LogOut } from "lucide-react";

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
  faUserGroup,
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
  { label: "Advisor", href: "/dashboard/advisor", icon: faUserGroup },
  // { label: "Documents", href: "/dashboard/documents", icon: faFileLines },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="pt-2">
        <Link href="/admin" className="flex items-center gap-3 rounded-md">
          <div className="flex w-full justify-left">
            <div className="relative h-[56px] w-[120px]">
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
        <SidebarSeparator className="my-2" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
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
                  className="data-[active=true]:bg-[#1B1856] data-[active=true]:text-white hover:data-[active=true]:bg-[#1B1856]"
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="h-4 w-4 opacity-90"
                      fixedWidth
                    />
                    <span>{item.label}</span>
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
                <LifeBuoy />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => {
                console.log("sign out");
              }}
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
