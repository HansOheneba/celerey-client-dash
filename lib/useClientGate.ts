"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  getSubscription,
  getUserType,
  AuthState,
  SubState,
} from "@/lib/client-data";

export function useClientGate(): {
  ready: boolean;
  auth: AuthState;
  sub: SubState;
  userType: "regular" | "enterprise";
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
  const [userType, setUserType] = useState<"regular" | "enterprise">("regular");

  useEffect(() => {
    const a = getAuth();
    const s = getSubscription();
    const t = getUserType();
    setAuthState(a);
    setSubState(s);
    setUserType(t);
    setReady(true);
  }, []);

  return { ready, auth, sub, userType };
}
