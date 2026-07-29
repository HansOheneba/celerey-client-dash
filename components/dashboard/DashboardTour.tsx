"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

import { buttonVariants } from "@/components/ui/button";
import {
  getActiveTourSteps,
  type DashboardTourStep,
  TOUR_STORAGE,
  TOUR_RESTART_EVENT,
  isTourCompleted,
  isTourSessionActive,
  consumeTourPending,
  markTourCompleted,
  getTourProgress,
  setTourProgress,
} from "@/lib/dashboard-tour";
import { useFinancialStore } from "@/store/financialStore";
import { hasCompletedRiskAssessment } from "@/lib/profile-checklist";
import { getAuth } from "@/lib/client-data";
import { isDemoMode } from "@/lib/demo-mode";
import { useProfilePanel } from "@/components/dashboard/ProfilePanelContext";

const START_DELAY_MS = 600;
const ELEMENT_WAIT_MS = 5000;
const ELEMENT_POLL_MS = 100;

let activeDriver: Driver | null = null;

function destroyActiveDriver() {
  if (activeDriver?.isActive()) {
    activeDriver.destroy();
  }
  activeDriver = null;
}

function waitForElement(
  selector: string | undefined,
  timeoutMs = ELEMENT_WAIT_MS,
): Promise<Element | null> {
  if (!selector) return Promise.resolve(null);

  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, ELEMENT_POLL_MS);
    };
    tick();
  });
}

function buildDescription(step: DashboardTourStep): string {
  return `<p class="celerey-tour-desc">${step.description}</p>`;
}

type TourFooterAction = {
  label: string;
  variant?: "default" | "outline";
  onClick: () => void;
};

/** Imperative buttons (no nested createRoot) so tour teardown can't race React. */
function mountTourFooterActions(
  container: HTMLElement,
  actions: TourFooterAction[],
) {
  container.replaceChildren();

  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.setAttribute("data-slot", "button");
    button.className = buttonVariants({
      variant: action.variant ?? "default",
      size: "sm",
    });
    button.addEventListener("click", action.onClick);
    container.appendChild(button);
  }
}

type DashboardTourProps = {
  layoutReady: boolean;
};

export function DashboardTour({ layoutReady }: DashboardTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useFinancialStore((s) => s.user);
  const riskAssessment = useFinancialStore((s) => s.riskAssessment);
  const hasRiskProfile = hasCompletedRiskAssessment({ user, riskAssessment });
  const userId = user?.user_id ?? getAuth().email ?? null;
  const { openRiskQuiz, openProfileAfterTour } = useProfilePanel();

  const tourSteps = React.useMemo(
    () => getActiveTourSteps(hasRiskProfile),
    [hasRiskProfile],
  );

  const running = React.useRef(false);
  const startedRef = React.useRef(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [tourActive, setTourActive] = React.useState(false);
  const [restartToken, setRestartToken] = React.useState(0);

  const syncProgress = React.useCallback((index: number) => {
    setStepIndex(index);
    setTourProgress(index, "nav");
  }, []);

  const finishTour = React.useCallback(
    (opts?: { deferProfileForRiskQuiz?: boolean }) => {
      destroyActiveDriver();
      markTourCompleted(userId);
      setTourActive(false);
      try {
        sessionStorage.removeItem(TOUR_STORAGE.active);
      } catch {
        /* noop */
      }
      openProfileAfterTour({
        deferForRiskQuiz: opts?.deferProfileForRiskQuiz,
      });
    },
    [openProfileAfterTour, userId],
  );

  const showStep = React.useCallback(
    async (index: number) => {
      if (running.current) return;
      if (!userId || isTourCompleted(userId)) return;

      running.current = true;

      const step = tourSteps[index];
      if (!step) {
        finishTour();
        running.current = false;
        return;
      }

      const el = await waitForElement(step.navSelector);
      destroyActiveDriver();

      const isLast = index >= tourSteps.length - 1;
      const isRiskStep = step.id === "risk-assessment";

      const driverObj = driver({
        animate: true,
        overlayColor: "#000000",
        overlayOpacity: 0.68,
        stagePadding: 6,
        stageRadius: 8,
        allowClose: true,
        showButtons: ["close"],
        popoverClass: "celerey-driver-popover",
        popoverOffset: 10,
        onCloseClick: () => {
          finishTour();
          running.current = false;
        },
        onDestroyed: () => {
          running.current = false;
        },
      });

      activeDriver = driverObj;

      driverObj.highlight({
        element: el ?? undefined,
        popover: {
          title: step.title,
          description: buildDescription(step),
          side: el ? "right" : "over",
          align: "start",
          onPopoverRender: (popover) => {
            popover.closeButton.style.display = "block";
            popover.nextButton.style.display = "none";
            popover.previousButton.style.display = "none";
            popover.progress.style.display = "none";

            const footer = popover.footer;
            footer.className = "driver-popover-footer celerey-tour-footer";
            footer.style.display = "flex";
            footer.innerHTML = "";

            const progress = document.createElement("span");
            progress.className = "celerey-tour-progress";
            progress.textContent = `${index + 1} / ${tourSteps.length}`;

            const actions = document.createElement("div");
            actions.className = "celerey-tour-actions";

            const goNext = () => {
              destroyActiveDriver();
              if (isLast) {
                finishTour();
                return;
              }
              const nextIndex = index + 1;
              const next = tourSteps[nextIndex];
              syncProgress(nextIndex);
              if (next && pathname !== next.href) {
                router.push(next.href);
              } else {
                window.setTimeout(() => void showStep(nextIndex), 150);
              }
            };

            if (isRiskStep) {
              mountTourFooterActions(actions, [
                {
                  label: "Finish tour",
                  variant: "outline",
                  onClick: () => {
                    destroyActiveDriver();
                    finishTour();
                  },
                },
                {
                  label: "Take assessment now",
                  onClick: () => {
                    destroyActiveDriver();
                    finishTour({ deferProfileForRiskQuiz: true });
                    openRiskQuiz();
                  },
                },
              ]);
            } else {
              mountTourFooterActions(actions, [
                {
                  label: isLast ? "Finish tour" : "Next",
                  onClick: goNext,
                },
              ]);
            }

            footer.appendChild(progress);
            footer.appendChild(actions);
          },
        },
      });

      running.current = false;
    },
    [finishTour, openRiskQuiz, pathname, router, syncProgress, tourSteps, userId],
  );

  React.useEffect(() => {
    function onRestart() {
      startedRef.current = false;
      setRestartToken((t) => t + 1);
    }
    window.addEventListener(TOUR_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(TOUR_RESTART_EVENT, onRestart);
  }, []);

  React.useEffect(() => {
    if (!layoutReady || !userId || startedRef.current) return;
    if (isDemoMode()) return;
    if (isTourCompleted(userId)) return;

    // Only auto-start for users arriving from onboarding (pending flag set),
    // or to resume a tour already mid-session. Direct logins skip the tour.
    const resumeActive = isTourSessionActive();
    const pendingForNewUser = consumeTourPending();
    if (!resumeActive && !pendingForNewUser) return;

    startedRef.current = true;

    const stored = resumeActive
      ? getTourProgress()
      : { stepIndex: 0, phase: "nav" as const };


    const clampedIndex = Math.min(
      stored.stepIndex,
      Math.max(0, tourSteps.length - 1),
    );

    syncProgress(clampedIndex);
    setTourActive(true);

    try {
      sessionStorage.setItem(TOUR_STORAGE.active, "true");
    } catch {
      /* noop */
    }

    const step = tourSteps[clampedIndex];
    const timer = window.setTimeout(() => {
      if (step && window.location.pathname !== step.href) {
        router.push(step.href);
      }
    }, START_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [layoutReady, restartToken, router, syncProgress, tourSteps, userId]);

  React.useEffect(() => {
    if (!tourActive || !userId || isTourCompleted(userId)) return;

    const step = tourSteps[stepIndex];
    if (!step || pathname !== step.href) return;

    const timer = window.setTimeout(() => {
      void showStep(stepIndex);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [tourActive, pathname, stepIndex, showStep, tourSteps, userId]);

  React.useEffect(() => () => destroyActiveDriver(), []);

  return null;
}
