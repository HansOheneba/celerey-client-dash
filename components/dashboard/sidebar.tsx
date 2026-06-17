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
  faUserTie,
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
import { ChevronDown, Settings, LogOut, UserIcon, Zap } from "lucide-react";
import {
  clearAuth,
  clearUserProfile,
  getUserFullName,
} from "@/lib/client-data";
import { useClientGate } from "@/lib/useClientGate";
import { useEffect, useMemo, useState } from "react";
import { useProfilePanel } from "./ProfilePanelContext";
import { useMockUpgrade } from "@/hooks/useMockUpgrade";
import { isDemoPath, toDemoPath } from "@/lib/demo-mode";

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
  { label: "Advisory", href: "/dashboard/advisor", icon: faUserTie },
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
  const displayName = user ? getUserFullName(user) : "";
  const userEmail = user?.email ?? "";
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { upgrading, upgrade: handleUpgrade } = useMockUpgrade();
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
  const inDemo = isDemoPath(pathname);
  const navHref = (href: string) => (inDemo ? toDemoPath(href) : href);
  const homeHref = inDemo ? toDemoPath("/dashboard") : "/dashboard";

  // ── Attention badges: incomplete checklist items mapped to their nav href ──
  const store = useFinancialStore();
  const attentionHrefs = useMemo(() => {
    const hrefs = new Set<string>();
    const s = useFinancialStore.getState();
    if (!s.goals.length) hrefs.add("/dashboard/goals");
    if (!s.holdings.length && !s.accounts.length)
      hrefs.add("/dashboard/assets");
    const hasAnyInsurance =
      s.insurancePolicies.length > 0 ||
      s.propertyAssets.some((p) => p.is_active && p.insurance.length > 0);
    if (!hasAnyInsurance) hrefs.add("/dashboard/insurance");
    if (
      !s.incomeRows.length ||
      !s.expenseCategories.length ||
      !s.emergencyFund.currentCashBalance
    )
      hrefs.add("/dashboard/cash-flow");
    const hasAnyLiability =
      s.liabilities.length > 0 ||
      s.propertyAssets.some((p) => p.is_active && !!p.mortgage);
    if (!hasAnyLiability) hrefs.add("/dashboard/liabilities");
    if (!s.retirement.desiredMonthlyIncome || !s.retirement.retirementAge)
      hrefs.add("/dashboard/retirement");
    return hrefs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.goals,
    store.holdings,
    store.accounts,
    store.insurancePolicies,
    store.propertyAssets,
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
      className="border-r border-white/10 text-white/80 relative"
    >
      {/* Ambient inner lighting - felt, not seen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(47,107,255,0.06), transparent 28%), radial-gradient(circle at bottom left, rgba(168,85,247,0.05), transparent 30%)",
        }}
      />

      {/* ── Header: Logo ── */}
      <SidebarHeader className="sticky top-0 z-10 h-14 flex-row items-center justify-center p-0 px-3 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <Link href={homeHref} className="flex items-center">
          {/* Full logo and symbol overlap and crossfade simultaneously - no stutter */}
          <div className="relative">
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className={collapsed ? "pointer-events-none" : ""}
            >
              <Image
                src="/logos/logoWhite.png"
                alt="Celerey"
                width={140}
                height={36}
                priority
                className="h-8 w-auto object-contain"
              />
            </motion.div>
            <motion.div
              animate={{ opacity: collapsed ? 1 : 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center"
            >
              <Image
                src="/logos/CelereySymbolLight.png"
                alt="Celerey"
                width={28}
                height={28}
                priority
                className="h-8 w-auto object-contain"
              />
            </motion.div>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="relative z-10 px-2 overflow-hidden">
        <SidebarMenu className="flex flex-col gap-1 mt-2">
          {nav.map((item) => {
            const href = navHref(item.href);
            const active =
              href === homeHref
                ? pathname === homeHref
                : pathname.startsWith(href);

            const tourNavId =
              item.href === "/dashboard"
                ? "overview"
                : (item.href.split("/").pop() ?? "overview");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className={`
                    relative rounded-md h-9 px-2.5
                    transition-colors
                    ${active ? "bg-white/15" : "hover:bg-white/8"}
                  `}
                >
                  <Link
                    className="flex items-center gap-2.5"
                    href={href}
                    data-tour-nav={tourNavId}
                  >
                    <span className="shrink-0">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`
                          h-4 w-4
                          ${active ? "text-white" : "text-white/50"}
                        `}
                        fixedWidth
                      />
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
                            text-sm leading-tight whitespace-nowrap
                            ${active ? "text-white font-medium" : "text-white/90"}
                          `}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarMenuButton>

                {/* Badge lives outside the overflow-hidden button so it's visible in both states */}
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
                      className="pointer-events-none absolute top-1.5 left-1.5 flex size-2"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-blue-200" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="my-2 bg-white/10" />

      {/* ── Profile Completion (above trial widget) ── */}
      <AnimatePresence initial={false}>
        {!collapsed && profileCompletionScore < 100 && (
          <motion.div
            key="profile-completion"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-2 pb-1.5"
          >
            <button
              type="button"
              onClick={openProfilePanel}
              className="w-full text-left rounded-md border border-white/12 bg-white/6 hover:bg-white/10 transition-colors px-2.5 py-2 space-y-1.5"
            >
              <p className="text-[11px] font-medium text-white/75 leading-none">
                Your profile is{" "}
                <span className="font-semibold text-white tabular-nums">
                  {profileCompletionScore}%
                </span>{" "}
                complete
              </p>
              <div className="h-1 rounded-full bg-white/12 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletionScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-white/90"
                />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upgrade to Pro Widget ── */}
      <AnimatePresence initial={false}>
        {showUpgradeWidget && (
          <motion.div
            key="upgrade-widget"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-2 pb-1.5"
          >
            <div
              className="rounded-md px-2.5 py-2 space-y-1.5 relative overflow-hidden"
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
                Upgrade to Pro for full access to all Celerey features.
              </p>

              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="relative w-full rounded-md bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/25 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {upgrading ? "Starting checkout…" : "Upgrade to Pro"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <SidebarFooter className="px-2 pb-2.5 space-y-0.5">
        {/* Support */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Support"
              className="h-9 hover:bg-white/8"
            >
              <Link
                href={navHref("/dashboard/support")}
                className="flex items-center gap-2.5 px-2.5"
              >
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="h-4 w-4 text-white/40"
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
                      className="text-sm text-white/60"
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
