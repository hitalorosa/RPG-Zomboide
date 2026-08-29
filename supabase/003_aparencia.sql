-- RPG Zomboide — migração 003: caracterização
-- Rodar no Supabase: SQL Editor → New query → colar → Run

-- Guarda todas as escolhas de aparência num campo só. Assim dá para
-- acrescentar peça nova (mais cabelo, mais chapéu) sem mexer no banco.
alter table public.personagens
  add column if not exists aparencia jsonb not null default '{}'::jsonb;
