"use client";

import Link from "next/link";
import Image from "next/image";
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
      <SidebarHeader className="pt-4 px-3">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative h-14 w-28">
            <AnimatePresence mode="wait" initial={false}>
              {collapsed ? (
                <motion.div
                  key="symbol"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/celerey_symbol_dark.png"
                    alt="Celerey"
                    width={44}
                    height={44}
                    priority
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="full"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="https://i.ibb.co/PGVKSsV1/image.png"
                    alt="Celerey"
                    width={110}
                    height={40}
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <SidebarSeparator className="my-3 bg-gray-200" />
      </SidebarHeader>

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
                            : "text-gray-400 group-hover:text-gray-600"
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
