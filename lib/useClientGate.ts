"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  getSubscription,
  AuthState,
  SubState,
} from "@/lib/client-data";

export function useClientGate(): {
  ready: boolean;
  auth: AuthState;
  sub: SubState;
} {
  const [ready, setReady] = useState(false);
  const [auth, setAuthState] = useState<AuthState>({
    loggedIn: false,
    email: null,
  });
  const [sub, setSubState] = useState<SubState>({
    status: "none",
    trialStartedAt: null,
  });

  useEffect(() => {
    const a = getAuth();
    const s = getSubscription();
    setAuthState(a);
    setSubState(s);
    setReady(true);
  }, []);

  return { ready, auth, sub };
}
