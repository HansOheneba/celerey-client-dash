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
import {
  ChevronDown,
  Settings,
  LogOut,
  UserIcon,
  Loader2,
  Zap,
} from "lucide-react";
import {
  clearAuth,
  clearUserProfile,
  getUserFullName,
} from "@/lib/client-data";
import { useClientGate } from "@/lib/useClientGate";
import { useEffect, useMemo, useState } from "react";
import { useProfilePanel } from "./ProfilePanelContext";

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
  // { label: "Legacy", href: "/dashboard/legacy", icon: faScroll },
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
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => setMounted(true), []);

  const { sub } = useClientGate();

  // Trial end date, formatted for display
  const trialEndsLabel = useMemo(() => {
    if (!sub.trialEndsAt) return null;
    return new Date(sub.trialEndsAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [sub.trialEndsAt]);

  const showUpgradeWidget = !collapsed && mounted && sub.status === "trialing";

  const profileCompletionScore = useFinancialStore(
    (s) => s.profileCompletionScore,
  );
  const { isOpen, open: openProfilePanel } = useProfilePanel();

  // ── Attention badges: incomplete checklist items mapped to their nav href ──
  const store = useFinancialStore();
  const attentionHrefs = useMemo(() => {
    const hrefs = new Set<string>();
    const s = useFinancialStore.getState();
    if (!s.goals.length) hrefs.add("/dashboard/goals");
    if (!s.holdings.length && !s.accounts.length)
      hrefs.add("/dashboard/assets");
    if (!s.insurancePolicies.length) hrefs.add("/dashboard/insurance");
    if (
      !s.incomeRows.length ||
      !s.expenseCategories.length ||
      !s.emergencyFund.currentCashBalance
    )
      hrefs.add("/dashboard/cash-flow");
    if (!s.liabilities.length) hrefs.add("/dashboard/liabilities");
    if (!s.retirement.desiredMonthlyIncome || !s.retirement.retirementAge)
      hrefs.add("/dashboard/retirement");
    return hrefs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.goals,
    store.holdings,
    store.accounts,
    store.insurancePolicies,
    store.incomeRows,
    store.expenseCategories,
    store.emergencyFund,
    store.liabilities,
    store.retirement,
  ]);

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-white border-r border-gray-200 text-gray-700"
    >
      {/* ── Header: Logo ── */}
      <SidebarHeader className="h-16 flex-row items-center justify-center p-0 px-3 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center">
          {/* Full logo and symbol overlap and crossfade simultaneously — no stutter */}
          <div className="relative">
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className={collapsed ? "pointer-events-none" : ""}
            >
              <Image
                src="/logos/logoDark.png"
                alt="Celerey"
                width={150}
                height={40}
                priority
                className="h-10 w-auto object-contain"
              />
            </motion.div>
            <motion.div
              animate={{ opacity: collapsed ? 1 : 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center"
            >
              <Image
                src="/logos/Celerey-Secondary-Symbol-Dark.png"
                alt="Celerey"
                width={28}
                height={28}
                priority
                className="h-7 w-auto object-contain"
              />
            </motion.div>
          </div>
        </Link>
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
                    <span className="relative shrink-0">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`
                          h-4 w-4
                          ${active ? "text-[#160b35]" : "text-gray-400"}
                        `}
                        fixedWidth
                      />
                      <AnimatePresence>
                        {attentionHrefs.has(item.href) && (
                          <motion.span
                            key="badge"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              damping: 16,
                              stiffness: 300,
                            }}
                            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 ring-1 ring-white"
                          />
                        )}
                      </AnimatePresence>
                    </span>

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
      {/* Hidden while the panel is open — they alternate */}
      <AnimatePresence initial={false}>
        {!collapsed && !isOpen && profileCompletionScore < 100 && (
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
              onClick={openProfilePanel}
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

      {/* ── Upgrade to Premium Widget ── */}
      <AnimatePresence initial={false}>
        {showUpgradeWidget && (
          <motion.div
            key="upgrade-widget"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-3 pb-2"
          >
            <div
              className="rounded-lg px-3 py-3 space-y-2 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #3b1fa8 0%, #18163f 40%, #7c3aed 65%, #18163f 100%)",
              }}
            >
              {/* subtle radial glow to mimic the logo orb */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 30%, rgba(168,85,247,0.45) 0%, transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-1.5">
                <p className="text-[11px] font-semibold text-white uppercase tracking-wide">
                  Trial account
                </p>
              </div>
              <p className="relative text-[11px] text-white/80 leading-snug">
                Upgrade to Premium for full access to all Celerey features.
              </p>

              <button
                type="button"
                className="relative w-full rounded-md bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/25 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <SidebarFooter className="px-2 pb-3 space-y-1">
        {/* Support */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Support"
              className="hover:bg-gray-50"
            >
              <Link
                href="/dashboard/support"
                className="flex items-center gap-3 px-3"
              >
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="h-4 w-4 text-gray-400"
                  fixedWidth
                />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="support-label"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.14 }}
                      className="text-sm text-gray-600"
                    >
                      Support
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
