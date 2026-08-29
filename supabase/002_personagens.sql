-- RPG Zomboide — migração 002: personagens
-- Rodar no Supabase: SQL Editor → New query → colar → Run

-- ---------------------------------------------------------------
-- Faltavam políticas de update/delete em jogadores.
-- Sem elas o banco recusa em silêncio (não dá erro, só não faz).
-- ---------------------------------------------------------------
drop policy if exists "edicao livre" on public.jogadores;
create policy "edicao livre"
  on public.jogadores for update using (true) with check (true);

drop policy if exists "remocao livre" on public.jogadores;
create policy "remocao livre"
  on public.jogadores for delete using (true);

-- Limpa a linha de teste da conexão, se ainda estiver lá.
delete from public.jogadores where lower(nome) = 'teste conexao';

-- ---------------------------------------------------------------
-- personagens — a ficha
-- Um jogador pode ter vários ao longo da campanha (personagem morre),
-- mas só um fica ativo por vez.
-- ---------------------------------------------------------------
create table if not exists public.personagens (
  id          uuid primary key default gen_random_uuid(),
  jogador_id  uuid not null references public.jogadores (id) on delete cascade,
  ativo       boolean not null default true,

  -- identidade
  nome             text not null default '',
  idade            text not null default '',
  pronomes         text not null default '',
  profissao_antes  text not null default '',

  -- especialização e o atributo que recebeu o +1
  especializacao        text,
  atributo_bonus        text,

  -- atributos (15 pontos distribuídos + 1 da especialização)
  forca        smallint not null default 0,
  agilidade    smallint not null default 0,
  resistencia  smallint not null default 0,
  intelecto    smallint not null default 0,
  percepcao    smallint not null default 0,

  -- estado
  vida       smallint not null default 0,  vida_max       smallint not null default 0,
  sanidade   smallint not null default 0,  sanidade_max   smallint not null default 0,
  medo       smallint not null default 0,  medo_max       smallint not null default 0,
  panico     smallint not null default 0,  panico_max     smallint not null default 0,
  estresse   smallint not null default 0,  estresse_max   smallint not null default 0,
  fadiga     smallint not null default 0,  fadiga_max     smallint not null default 0,
  condicao   text not null default 'Normal',

  -- inventário
  arma             text not null default '',
  arma_barulhenta  boolean not null default false,
  itens            text not null default '',

  -- perfil
  qualidade        text not null default '',
  defeito          text not null default '',
  maior_medo       text not null default '',
  como_se_acalma   text not null default '',

  historia   text not null default '',

  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- Só um personagem ativo por jogador.
create unique index if not exists personagens_um_ativo
  on public.personagens (jogador_id) where ativo;

create index if not exists personagens_por_jogador
  on public.personagens (jogador_id);

-- atualiza atualizado_em sozinho
create or replace function public.toca_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists personagens_atualizado_em on public.personagens;
create trigger personagens_atualizado_em
  before update on public.personagens
  for each row execute function public.toca_atualizado_em();

-- ---------------------------------------------------------------
-- Permissões — mesa privada, todo mundo de confiança.
-- ---------------------------------------------------------------
alter table public.personagens enable row level security;

drop policy if exists "personagens leitura" on public.personagens;
create policy "personagens leitura"
  on public.personagens for select using (true);

drop policy if exists "personagens insercao" on public.personagens;
create policy "personagens insercao"
  on public.personagens for insert with check (true);

drop policy if exists "personagens edicao" on public.personagens;
create policy "personagens edicao"
  on public.personagens for update using (true) with check (true);

drop policy if exists "personagens remocao" on public.personagens;
create policy "personagens remocao"
  on public.personagens for delete using (true);
