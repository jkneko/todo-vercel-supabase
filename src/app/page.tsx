import { AuthForm } from "@/components/auth-form";
import { SignOutButton } from "@/components/sign-out-button";
import { TodoApp } from "@/components/todo-app";
import { getSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Todo } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { url, anonKey } = getSupabasePublicEnv();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let todos: Todo[] = [];

  if (user) {
    const { data } = await supabase
      .from("todos")
      .select("id, user_id, title, is_completed, created_at")
      .order("created_at", { ascending: false });

    todos = (data ?? []) as Todo[];
  }

  return (
    <main className="container">
      <section className="hero stack-md">
        <div className="stack-sm">
          <p className="eyebrow">Next.js + Supabase</p>
          <h1>Vercel 配置テスト用 Todo アプリ</h1>
          <p className="lead">
            認証・Todo CRUD・RLS の最低限を確認するための、安全寄りな検証用サンプルです。
            service_role は使わず、ユーザー単位でデータを分離しています。
          </p>
        </div>

        {user ? (
          <div className="stack-md">
            <TodoApp
              initialTodos={todos}
              userEmail={user.email ?? "unknown"}
              supabaseUrl={url}
              supabaseAnonKey={anonKey}
            />
            <SignOutButton supabaseUrl={url} supabaseAnonKey={anonKey} />
          </div>
        ) : (
          <div className="stack-md">
            <AuthForm supabaseUrl={url} supabaseAnonKey={anonKey} />
            <section className="card stack-sm">
              <h2>このサンプルで確認できること</h2>
              <ul className="featureList">
                <li>Supabase Auth (Magic Link)</li>
                <li>Todo の追加 / 完了切り替え / 削除</li>
                <li>RLS によるユーザー単位のアクセス制御</li>
                <li>Vercel へのデプロイ動作確認</li>
              </ul>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
