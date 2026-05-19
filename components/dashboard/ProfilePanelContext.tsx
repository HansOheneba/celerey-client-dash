"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const DISMISSED_KEY = "profile_panel_dismissed_v1";

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

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY) === "true";
    if (!dismissed) {
      setWelcomeOpen(true);
    }
  }, []);

  function dismissWelcome() {
    setWelcomeOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
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
