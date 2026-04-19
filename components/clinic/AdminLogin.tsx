"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isElevatedRole, setSessionCookies } from "@/lib/session-utils";
import { upsertUserProfile } from "@/lib/user-profiles";

type AuthMode = "signin" | "signup";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

function getAuthErrorMessage(code: string, mode: AuthMode) {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/operation-not-allowed":
      return mode === "signup"
        ? "Email/Password sign-up is not enabled in Firebase Authentication."
        : "Email/Password sign-in is not enabled in Firebase Authentication.";
    default:
      return "Login failed. Please try again.";
  }
}

function getGoogleAuthErrorMessage(code: string) {
  switch (code) {
    case "auth/account-exists-with-different-credential":
      return "That email already exists with another sign-in method.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/cancelled-popup-request":
      return "Another Google sign-in request is already in progress.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase Authentication yet.";
    default:
      return "Google sign-in failed. Please try again.";
  }
}

function resolveNextPath(role: "user" | "reception" | "admin" | "owner", redirectPath: string) {
  if (isElevatedRole(role)) {
    return redirectPath.startsWith("/dashboard") ? redirectPath : "/dashboard/appointments";
  }

  return "/history?view=mine";
}

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [redirectPath, setRedirectPath] = useState("/dashboard/appointments");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      setRedirectPath(redirect);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.uid || !user.email) {
        return;
      }

      try {
        const profile = await upsertUserProfile({
          uid: user.uid,
          name: user.displayName || user.email.split("@")[0] || "Clinic User",
          email: user.email,
        });

        setSessionCookies(profile.role);
        router.replace(resolveNextPath(profile.role, redirect || "/dashboard/appointments"));
      } catch {
        setError("Your account could not be synced with Firestore.");
      }
    });

    return unsubscribe;
  }, [router]);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError("");
    setSuccess("");

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (caughtError) {
      const code =
        caughtError && typeof caughtError === "object" && "code" in caughtError
          ? String((caughtError as { code: string }).code)
          : "";

      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      setError(getGoogleAuthErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      let uid = "";
      let email = form.email.trim();
      let name = form.name.trim() || form.email.trim().split("@")[0] || "Clinic User";

      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email, form.password);
        uid = credential.user.uid;
        email = credential.user.email || email;
        name = form.name.trim() || credential.user.email?.split("@")[0] || "Clinic User";

        if (form.name.trim()) {
          await updateProfile(credential.user, {
            displayName: form.name.trim(),
          });
        }

        setSuccess("Account created. You can use this login as a normal user immediately.");
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, form.password);
        uid = credential.user.uid;
        email = credential.user.email || email;
        name = credential.user.displayName || credential.user.email?.split("@")[0] || name;
      }

      const profile = await upsertUserProfile({
        uid,
        name,
        email,
      });

      setSessionCookies(profile.role);
      router.push(resolveNextPath(profile.role, redirectPath));
    } catch (caughtError) {
      const code =
        caughtError && typeof caughtError === "object" && "code" in caughtError
          ? String((caughtError as { code: string }).code)
          : "";
      setError(getAuthErrorMessage(code, mode));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="hero-glow left-[10%] top-[12%] bg-teal-200" />
      <div className="hero-glow right-[10%] top-[22%] bg-sky-200" />
      <div className="relative w-full max-w-xl card-surface px-6 py-8 sm:px-8">
        <span className="eyebrow">Account Login</span>
        <h1 className="mt-5 font-display text-5xl text-slate-950">Sign in or create an account</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          New accounts start as a normal user. Logged-in users can view their own appointment
          history, while only `reception`, `admin`, or `owner` roles can open the dashboard.
        </p>

        <button
          type="button"
          className="btn-secondary mt-6 w-full gap-3"
          onClick={() => void handleGoogleAuth()}
          disabled={submitting || googleLoading}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
          >
            <path
              d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.32 2.97-7.3Z"
              fill="#4285F4"
            />
            <path
              d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.24-2.52c-.9.6-2.05.96-3.37.96-2.59 0-4.79-1.75-5.58-4.1H3.07v2.6A9.99 9.99 0 0 0 12 22Z"
              fill="#34A853"
            />
            <path
              d="M6.42 13.89A5.98 5.98 0 0 1 6.1 12c0-.66.11-1.3.32-1.89V7.5H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.5l3.35-2.61Z"
              fill="#FBBC05"
            />
            <path
              d="M12 6.01c1.47 0 2.79.5 3.83 1.49l2.87-2.88C16.95 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.07 7.5l3.35 2.61C7.21 7.76 9.41 6.01 12 6.01Z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>Email and password</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccess("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccess("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Full Name
              <input
                className="field-input"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Your name"
                required={mode === "signup"}
              />
            </label>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              className="field-input"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <input
              className="field-input"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Enter password"
              required
            />
          </label>

          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Confirm Password
              <input
                className="field-input"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Re-enter password"
                required={mode === "signup"}
              />
            </label>
          ) : null}

          <button
            className="btn-primary mt-2 w-full"
            type="submit"
            disabled={submitting || googleLoading}
          >
            {submitting
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-[24px] border border-[color:var(--border)] bg-slate-50/80 px-4 py-4 text-xs leading-6 text-slate-500">
          Enable both `Email/Password` and `Google` in Firebase Authentication. Firestore will
          store every new user in the `users` collection with `role: "user"` by default. Change
          that role manually later if the same account should become reception, admin, or owner.
        </div>
      </div>
    </div>
  );
}
