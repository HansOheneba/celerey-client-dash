"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { isTourCompleted, WELCOME_SESSION_KEY } from "@/lib/dashboard-tour";
import { useFinancialStore } from "@/store/financialStore";
import { getAuth } from "@/lib/client-data";

interface ProfilePanelContextValue {
  /** Side-sheet checklist panel */
  isOpen: boolean;
  open: () => void;
  dismiss: () => void;
  /** Welcome "complete your profile" dialog */
  welcomeOpen: boolean;
  openWelcome: () => void;
  dismissWelcome: () => void;
  /** Risk assessment quiz */
  riskQuizOpen: boolean;
  openRiskQuiz: () => void;
  closeRiskQuiz: () => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextValue>({
  isOpen: false,
  open: () => {},
  dismiss: () => {},
  welcomeOpen: false,
  openWelcome: () => {},
  dismissWelcome: () => {},
  riskQuizOpen: false,
  openRiskQuiz: () => {},
  closeRiskQuiz: () => {},
});

export function ProfilePanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [riskQuizOpen, setRiskQuizOpen] = useState(false);
  const userId =
    useFinancialStore((s) => s.user?.user_id) ?? getAuth().email ?? null;

  useEffect(() => {
    if (!userId) return;

    const dismissedSession =
      typeof window !== "undefined" &&
      sessionStorage.getItem(WELCOME_SESSION_KEY) === "true";
    if (dismissedSession) return;

    if (isTourCompleted(userId)) {
      setWelcomeOpen(true);
    }
  }, [userId]);

  function dismissWelcome() {
    setWelcomeOpen(false);
    try {
      sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
    } catch {
      // noop
    }
  }

  return (
    <ProfilePanelContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        dismiss: () => setIsOpen(false),
        welcomeOpen,
        openWelcome: () => setWelcomeOpen(true),
        dismissWelcome,
        riskQuizOpen,
        openRiskQuiz: () => setRiskQuizOpen(true),
        closeRiskQuiz: () => setRiskQuizOpen(false),
      }}
    >
      {children}
    </ProfilePanelContext.Provider>
  );
}

export function useProfilePanel() {
  return useContext(ProfilePanelContext);
}
