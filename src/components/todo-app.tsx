"use client";

import { useMemo, useState } from "react";

import { createBrowserClient } from "@supabase/ssr";

import type { Todo } from "@/lib/types";

type TodoAppProps = {
  initialTodos: Todo[];
  userEmail: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function TodoApp({
  initialTodos,
  userEmail,
  supabaseUrl,
  supabaseAnonKey,
}: TodoAppProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(
    () => createBrowserClient(supabaseUrl, supabaseAnonKey),
    [supabaseAnonKey, supabaseUrl],
  );

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.is_completed).length,
    [todos],
  );

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("todos")
        .insert({ title: trimmedTitle })
        .select("id, user_id, title, is_completed, created_at")
        .single();

      if (insertError) {
        throw insertError;
      }

      setTodos((current) => [data as Todo, ...current]);
      setTitle("");
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error ? caughtError.message : "Todo の追加に失敗しました。";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    setError(null);

    const nextCompleted = !todo.is_completed;
    const previousTodos = todos;

    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? { ...item, is_completed: nextCompleted } : item,
      ),
    );

    try {
      const { error: updateError } = await supabase
        .from("todos")
        .update({ is_completed: nextCompleted })
        .eq("id", todo.id);

      if (updateError) {
        throw updateError;
      }
    } catch (caughtError) {
      setTodos(previousTodos);
      const nextError =
        caughtError instanceof Error ? caughtError.message : "Todo の更新に失敗しました。";
      setError(nextError);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    setError(null);
    const previousTodos = todos;

    setTodos((current) => current.filter((todo) => todo.id !== todoId));

    try {
      const { error: deleteError } = await supabase.from("todos").delete().eq("id", todoId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (caughtError) {
      setTodos(previousTodos);
      const nextError =
        caughtError instanceof Error ? caughtError.message : "Todo の削除に失敗しました。";
      setError(nextError);
    }
  };

  return (
    <div className="stack-lg">
      <section className="card stack-md">
        <div className="row wrap spaceBetween gap-md alignStart">
          <div className="stack-xs">
            <p className="eyebrow">Signed in</p>
            <h1>Todo Demo</h1>
            <p className="muted">{userEmail}</p>
          </div>
          <div className="pill">未完了 {remainingCount} 件</div>
        </div>

        <form className="row gap-sm wrap" onSubmit={handleAddTodo}>
          <input
            className="input grow"
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="新しい Todo を入力"
            maxLength={120}
            required
          />
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "追加中..." : "追加"}
          </button>
        </form>

        {error ? <p className="errorText">{error}</p> : null}
      </section>

      <section className="card stack-md">
        <div className="stack-xs">
          <h2>My Todos</h2>
          <p className="muted">RLS により、自分の Todo しか取得・更新・削除できません。</p>
        </div>

        {todos.length === 0 ? (
          <div className="emptyState">
            <p>Todo はまだありません。1件追加して動作確認できます。</p>
          </div>
        ) : (
          <ul className="todoList">
            {todos.map((todo) => (
              <li className="todoItem" key={todo.id}>
                <label className="todoCheck">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => handleToggleTodo(todo)}
                  />
                  <span className={todo.is_completed ? "todoTitle todoTitleDone" : "todoTitle"}>
                    {todo.title}
                  </span>
                </label>
                <button
                  className="textButton"
                  type="button"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
