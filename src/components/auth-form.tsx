"use client";

import { useMemo, useState } from "react";

import { createBrowserClient } from "@supabase/ssr";

type AuthFormProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function AuthForm({ supabaseUrl, supabaseAnonKey }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useMemo(
    () => createBrowserClient(supabaseUrl, supabaseAnonKey),
    [supabaseAnonKey, supabaseUrl],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setMessage("ログインリンクを送信しました。メールを確認してください。");
      setEmail("");
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError.message
          : "ログインリンクの送信に失敗しました。";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card stack-md" onSubmit={handleSubmit}>
      <div className="stack-xs">
        <h2>Magic Link でログイン</h2>
        <p className="muted">
          Supabase Auth を使った検証用ログインです。登録済みでなくても送信時に作成できます。
        </p>
      </div>

      <label className="stack-xs">
        <span>メールアドレス</span>
        <input
          className="input"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "ログインリンクを送る"}
      </button>

      {message ? <p className="successText">{message}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}
    </form>
  );
}
