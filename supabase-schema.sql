-- Create a Todo table with Row Level Security enabled.
-- Run this in the Supabase SQL Editor for your test project.

create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  is_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

create policy "Users can view their own todos"
  on public.todos
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own todos"
  on public.todos
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own todos"
  on public.todos
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own todos"
  on public.todos
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.handle_new_todo_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists set_todo_user_id on public.todos;

create trigger set_todo_user_id
before insert on public.todos
for each row
execute function public.handle_new_todo_user_id();
