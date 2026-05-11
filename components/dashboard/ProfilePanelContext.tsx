"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const DISMISSED_KEY = "profile_panel_dismissed_v1";

interface ProfilePanelContextValue {
  isOpen: boolean;
  open: () => void;
  dismiss: () => void;
  riskQuizOpen: boolean;
  openRiskQuiz: () => void;
  closeRiskQuiz: () => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextValue>({
  isOpen: false,
  open: () => {},
  dismiss: () => {},
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
  const [riskQuizOpen, setRiskQuizOpen] = useState(false);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY) === "true";
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  function open() {
    setIsOpen(true);
  }

  function dismiss() {
    setIsOpen(false);
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
        open,
        dismiss,
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
