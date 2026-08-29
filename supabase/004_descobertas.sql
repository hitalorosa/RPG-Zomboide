-- RPG Zomboide — migração 004: descobertas
-- Rodar no Supabase: SQL Editor → New query → colar → Run

-- O que o grupo já conhece. O conteudo (descricao das criaturas e faccoes)
-- fica no codigo; aqui guardamos so o que foi revelado.
create table if not exists public.descobertas (
  chave        text primary key,          -- ex: 'criatura:estalador'
  revelado_em  timestamptz not null default now()
);

alter table public.descobertas enable row level security;

drop policy if exists "descobertas leitura" on public.descobertas;
create policy "descobertas leitura" on public.descobertas for select using (true);

drop policy if exists "descobertas insercao" on public.descobertas;
create policy "descobertas insercao" on public.descobertas for insert with check (true);

drop policy if exists "descobertas remocao" on public.descobertas;
create policy "descobertas remocao" on public.descobertas for delete using (true);

-- Comum e Corredor ja nascem revelados.
insert into public.descobertas (chave) values ('criatura:comum'), ('criatura:corredor')
  on conflict (chave) do nothing;

-- O grupo mora na Base, entao ja conhece o Conselho. Os Cicatrizes nao.
insert into public.descobertas (chave) values
  ('faccao:wilson'), ('faccao:neide'), ('faccao:bandeira'),
  ('faccao:rosana'), ('faccao:soldado')
  on conflict (chave) do nothing;
