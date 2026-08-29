-- RPG Zomboide — esquema do banco
-- Rodar no Supabase: painel do projeto → SQL Editor → New query → colar → Run

-- ---------------------------------------------------------------
-- jogadores
-- Quem senta na mesa. Sem senha: a "entrada" é escolher o próprio nome.
-- ---------------------------------------------------------------
create table if not exists public.jogadores (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  criado_em  timestamptz not null default now()
);

-- Impede "Jay" e "jay" virarem duas pessoas diferentes.
create unique index if not exists jogadores_nome_unico
  on public.jogadores (lower(nome));

-- ---------------------------------------------------------------
-- Permissões
-- A mesa é privada e todo mundo é de confiança, então a política é
-- aberta para a chave anônima. Se um dia o site virar público, é AQUI
-- que isso precisa mudar.
-- ---------------------------------------------------------------
alter table public.jogadores enable row level security;

drop policy if exists "leitura livre" on public.jogadores;
create policy "leitura livre"
  on public.jogadores for select
  using (true);

drop policy if exists "entrada livre" on public.jogadores;
create policy "entrada livre"
  on public.jogadores for insert
  with check (true);
