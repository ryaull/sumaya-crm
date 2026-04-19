"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import { clearSessionCookies, setSessionCookies } from "@/lib/session-utils";
import { upsertUserProfile } from "@/lib/user-profiles";
import { UserProfile } from "@/types";

type CurrentUserContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setUser(nextUser);

      if (!nextUser?.uid || !nextUser.email) {
        setProfile(null);
        clearSessionCookies();
        setLoading(false);
        return;
      }

      try {
        const synced = await upsertUserProfile({
          uid: nextUser.uid,
          name: nextUser.displayName || nextUser.email.split("@")[0] || "Clinic User",
          email: nextUser.email,
        });

        setProfile(synced);
        setSessionCookies(synced.role);
      } catch {
        setProfile(null);
        clearSessionCookies();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
    }),
    [loading, profile, user],
  );

  return createElement(CurrentUserContext.Provider, { value }, children);
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used inside a CurrentUserProvider");
  }

  return context;
}
