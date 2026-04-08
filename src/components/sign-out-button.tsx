"use client";

import { useMemo, useState } from "react";

import { createBrowserClient } from "@supabase/ssr";

type SignOutButtonProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function SignOutButton({ supabaseUrl, supabaseAnonKey }: SignOutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(
    () => createBrowserClient(supabaseUrl, supabaseAnonKey),
    [supabaseAnonKey, supabaseUrl],
  );

  const handleSignOut = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      window.location.reload();
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError.message
          : "サインアウトに失敗しました。";
      setError(nextError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stack-xs">
      <button className="button buttonSecondary" onClick={handleSignOut} disabled={isSubmitting}>
        {isSubmitting ? "サインアウト中..." : "サインアウト"}
      </button>
      {error ? <p className="errorText">{error}</p> : null}
    </div>
  );
}
