"use client";

import { useEffect, useState } from "react";
import {
  listarMesa,
  salvarPersonagem,
  type LinhaMesa,
  type Personagem,
} from "@/lib/personagens";
import { acharEspecializacao, ATRIBUTOS, ESTADOS } from "@/lib/regras";
import { MAPAS, MAPA_PADRAO } from "@/lib/mapas";
import { supabaseConfigurado } from "@/lib/supabase";

const COR_ESTADO: Record<string, string> = {
  vida: "var(--color-rust)",
  sanidade: "var(--color-sage)",
  medo: "var(--color-ochre)",
  panico: "var(--color-perigo)",
  estresse: "var(--color-ochre)",
  fadiga: "var(--color-bone-dim)",
};

export default function PaginaMesa() {
  const [linhas, setLinhas] = useState<LinhaMesa[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<LinhaMesa | null>(null);
  const [mapa, setMapa] = useState(MAPA_PADRAO);
  const [doses, setDoses] = useState(0);

  function recarregar() {
    listarMesa()
      .then(setLinhas)
      .catch((e: Error) => setErro(e.message));
  }

  useEffect(() => {
    recarregar();
    try {
      const d = window.localStorage.getItem("zomboide:doses");
      if (d) setDoses(Number(d) || 0);
    } catch {}
  }, []);

  function mudarDoses(n: number) {
    const v = Math.max(0, n);
    setDoses(v);
    try {
      window.localStorage.setItem("zomboide:doses", String(v));
    } catch {}
  }

  const indice = MAPAS.findIndex((m) => m.chave === mapa.chave);
  const irPara = (n: number) =>
    setMapa(MAPAS[(n + MAPAS.length) % MAPAS.length]);

  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      {/* ============================ topo ============================= */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-3 border-b border-line">
        <nav className="flex items-center gap-5">
          <button
            disabled
            title="Ainda não construído"
            className="fonte-display uppercase text-sm sm:text-base tracking-wide text-bone-dim/40 cursor-not-allowed"
          >
            Criaturas
          </button>
          <button
            disabled
            title="Ainda não construído"
            className="fonte-display uppercase text-sm sm:text-base tracking-wide text-bone-dim/40 cursor-not-allowed"
          >
            Facções conhecidas
          </button>
        </nav>

        {/* doses de Freio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => mudarDoses(doses - 1)}
            aria-label="Menos uma dose"
            className="h-8 w-8 rounded-lg border border-line text-bone-dim hover:border-sage hover:text-bone transition-colors"
          >
            −
          </button>
          <span className="fonte-display text-2xl sm:text-3xl tabular-nums text-bone">
            {doses}
            <span className="text-bone-dim text-lg">×</span>
          </span>
          <span className="text-2xl" title="Doses de Freio">
            💉
          </span>
          <button
            onClick={() => mudarDoses(doses + 1)}
            aria-label="Mais uma dose"
            className="h-8 w-8 rounded-lg border border-line text-bone-dim hover:border-sage hover:text-bone transition-colors"
          >
            +
          </button>
        </div>
      </header>

      {/* ============================ mapa ============================= */}
      <section className="flex-1 min-h-0 relative flex items-center justify-center p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapa.arquivo}
          alt={`Mapa: ${mapa.nome}`}
          className="max-h-full max-w-full object-contain rounded-xl"
        />

        {/* nome do mapa, sobre a imagem */}
        <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2">
          <span className="fonte-display uppercase tracking-[0.2em] text-lg sm:text-xl text-bone drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {mapa.nome}
          </span>
        </div>

        {/* setas, sobre a imagem */}
        <button
          onClick={() => irPara(indice - 1)}
          aria-label="Mapa anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full
                     bg-ink/70 border border-line text-bone backdrop-blur
                     hover:border-sage hover:text-sage transition-colors"
        >
          ‹
        </button>
        <button
          onClick={() => irPara(indice + 1)}
          aria-label="Próximo mapa"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full
                     bg-ink/70 border border-line text-bone backdrop-blur
                     hover:border-sage hover:text-sage transition-colors"
        >
          ›
        </button>

        {/* seletor, sobre a imagem */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 max-w-[95%] overflow-x-auto">
          <div className="flex gap-1.5 rounded-full bg-ink/75 border border-line px-2 py-1.5 backdrop-blur">
            {MAPAS.map((m) => {
              const ativo = m.chave === mapa.chave;
              return (
                <button
                  key={m.chave}
                  onClick={() => setMapa(m)}
                  aria-pressed={ativo}
                  className={`fonte-display uppercase whitespace-nowrap rounded-full px-3 py-1.5 text-xs tracking-wide transition-colors ${
                    ativo
                      ? "bg-sage/25 text-sage"
                      : "text-bone-dim hover:text-bone"
                  }`}
                >
                  {m.nome}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================= sobreviventes ======================== */}
      <footer className="shrink-0 border-t border-line px-4 py-3">
        {erro ? (
          <p className="text-center text-xs text-perigo">{erro}</p>
        ) : linhas.length === 0 ? (
          <p className="text-center text-xs text-bone-dim">
            {supabaseConfigurado
              ? "Ninguém entrou ainda."
              : "Banco não conectado."}
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {linhas.map((l) => (
              <CartaoJogador
                key={l.jogador.id}
                linha={l}
                aoAbrir={() => setAberto(l)}
              />
            ))}
          </div>
        )}
      </footer>

      {aberto && (
        <Painel
          linha={aberto}
          aoFechar={() => setAberto(null)}
          aoSalvar={() => {
            setAberto(null);
            recarregar();
          }}
        />
      )}
    </div>
  );
}

/* --------------------------- cartão do jogador -------------------------- */

function CartaoJogador({
  linha,
  aoAbrir,
}: {
  linha: LinhaMesa;
  aoAbrir: () => void;
}) {
  const p = linha.personagem;

  return (
    <button
      onClick={aoAbrir}
      className="shrink-0 w-52 rounded-xl border border-line bg-surface/50 px-3 py-2.5 text-left
                 transition-colors hover:border-sage"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="fonte-display uppercase text-sm text-bone truncate">
          {p?.nome?.trim() || linha.jogador.nome}
        </span>
        {p?.condicao && p.condicao !== "Normal" && (
          <span className="shrink-0 text-[9px] uppercase text-perigo">
            {p.condicao}
          </span>
        )}
      </div>

      {!p ? (
        <p className="mt-2 text-[11px] text-bone-dim">Sem ficha</p>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {ESTADOS.map((e) => {
            const atual = p[e.chave] as number;
            const max = p[`${e.chave}_max` as keyof Personagem] as number;
            const pct = max > 0 ? Math.min(100, (atual / max) * 100) : 0;
            return (
              <div key={e.chave}>
                <div className="flex justify-between text-[9px] uppercase text-bone-dim leading-tight">
                  <span>{e.nome.slice(0, 4)}</span>
                  <span className="tabular-nums text-bone">{atual}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COR_ESTADO[e.chave],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}

/* ------------------------------- painel -------------------------------- */

function Painel({
  linha,
  aoFechar,
  aoSalvar,
}: {
  linha: LinhaMesa;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const p = linha.personagem;
  const [url, setUrl] = useState(p?.retrato_url ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gravarRetrato() {
    if (!p) return;
    setErro(null);
    setSalvando(true);
    try {
      await salvarPersonagem({ ...p, retrato_url: url.trim() } as Personagem);
      aoSalvar();
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(false);
    }
  }

  const esp = acharEspecializacao(p?.especializacao);

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/75 sm:p-6"
      onClick={aoFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl
                   border border-line bg-ink p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="fonte-display text-xs tracking-[0.3em] text-rust">
              {linha.jogador.nome.toUpperCase()}
            </p>
            <h2 className="fonte-display uppercase text-bone text-2xl leading-none mt-1">
              {p?.nome?.trim() || "Sem personagem"}
            </h2>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="shrink-0 text-bone-dim hover:text-bone text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {!p ? (
          <p className="mt-6 text-sm text-bone-dim">
            Esse jogador ainda não preencheu a ficha.
          </p>
        ) : (
          <>
            <Bloco titulo="Descrição visual">
              {p.descricao_visual?.trim() ? (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone">
                    {p.descricao_visual}
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(p.descricao_visual)
                    }
                    className="mt-3 text-xs uppercase tracking-wider text-bone-dim hover:text-sage transition-colors"
                  >
                    Copiar descrição
                  </button>
                </>
              ) : (
                <p className="text-sm text-bone-dim">Não preencheu.</p>
              )}
            </Bloco>

            <Bloco titulo="Retrato">
              {p.retrato_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.retrato_url}
                  alt=""
                  className="mb-3 w-40 rounded-xl border border-line"
                />
              )}
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/retratos/nome.png"
                  className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-bone
                             placeholder:text-bone-dim/50 outline-none focus:border-sage"
                />
                <button
                  onClick={gravarRetrato}
                  disabled={salvando}
                  className="fonte-display uppercase rounded-xl bg-rust px-4 py-2.5 text-sm text-bone disabled:opacity-30"
                >
                  {salvando ? "…" : "Salvar"}
                </button>
              </div>
              {erro && <p className="mt-2 text-xs text-perigo">{erro}</p>}
            </Bloco>

            <Bloco titulo="Atributos">
              <div className="grid grid-cols-5 gap-2 text-center">
                {ATRIBUTOS.map((a) => (
                  <div key={a.chave} className="rounded-lg border border-line py-2">
                    <div className="fonte-display text-xl text-bone">
                      {(p[a.chave] as number) +
                        (p.atributo_bonus === a.chave ? 1 : 0)}
                    </div>
                    <div className="text-[10px] uppercase text-bone-dim">
                      {a.nome.slice(0, 3)}
                    </div>
                  </div>
                ))}
              </div>
              {esp && (
                <p className="mt-3 text-xs text-bone-dim">
                  {esp.nome} — {esp.descricao}
                </p>
              )}
            </Bloco>

            <Bloco titulo="Perfil">
              <Linha rotulo="Qualidade" valor={p.qualidade} />
              <Linha rotulo="Defeito" valor={p.defeito} />
              <Linha rotulo="Maior medo" valor={p.maior_medo} />
              <Linha rotulo="Se acalma com" valor={p.como_se_acalma} />
              <Linha rotulo="Arma" valor={p.arma} />
            </Bloco>

            {p.historia?.trim() && (
              <Bloco titulo="História">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone">
                  {p.historia}
                </p>
              </Bloco>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="fonte-display uppercase text-xs tracking-[0.2em] text-rust mb-2">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="flex gap-2 text-sm py-0.5">
      <span className="text-bone-dim shrink-0">{rotulo}:</span>
      <span className="text-bone">{valor?.trim() || "—"}</span>
    </p>
  );
}
