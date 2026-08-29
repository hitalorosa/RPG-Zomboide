-- RPG Zomboide, migracao 005: rolagens de dado
-- Rodar no Supabase: SQL Editor > New query > colar > Run

create table if not exists public.rolagens (
  id           uuid primary key default gen_random_uuid(),
  quem         text not null,
  rotulo       text not null default '',
  formula      text not null,              -- 'd20', '2d6', '2d20 vantagem'
  resultados   smallint[] not null,
  modificador  smallint not null default 0,
  total        smallint not null,
  criado_em    timestamptz not null default now()
);

create index if not exists rolagens_recentes
  on public.rolagens (criado_em desc);

alter table public.rolagens enable row level security;

drop policy if exists "rolagens leitura" on public.rolagens;
create policy "rolagens leitura" on public.rolagens for select using (true);

drop policy if exists "rolagens insercao" on public.rolagens;
create policy "rolagens insercao" on public.rolagens for insert with check (true);

drop policy if exists "rolagens remocao" on public.rolagens;
create policy "rolagens remocao" on public.rolagens for delete using (true);
