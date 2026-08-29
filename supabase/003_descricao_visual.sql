-- RPG Zomboide — migração 003: descrição visual e retrato
-- Rodar no Supabase: SQL Editor → New query → colar → Run

alter table public.personagens
  add column if not exists descricao_visual text not null default '',
  add column if not exists retrato_url      text not null default '';

-- a caracterizacao por avatar foi descartada
alter table public.personagens drop column if exists aparencia;
