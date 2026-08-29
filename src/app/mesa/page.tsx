"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const [ficha, setFicha] = useState<LinhaMesa | null>(null);
  const [retrato, setRetrato] = useState<LinhaMesa | null>(null);
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



  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") irPara(indice - 1);
      if (e.key === "ArrowRight") irPara(indice + 1);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      {/* ============================ topo ============================= */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-1.5 border-b border-line">
        <nav className="flex items-center gap-5">
          <Link
            href="/criaturas"
            className="fonte-display uppercase text-sm tracking-wide text-bone-dim hover:text-bone transition-colors"
          >
            Criaturas
          </Link>
          <Link
            href="/dados"
            className="fonte-display uppercase text-sm tracking-wide text-bone-dim hover:text-bone transition-colors"
          >
            Dados
          </Link>
          <Link
            href="/faccoes"
            className="fonte-display uppercase text-sm tracking-wide text-bone-dim hover:text-bone transition-colors"
          >
            Facções conhecidas
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => mudarDoses(doses - 1)}
            aria-label="Menos uma dose"
            className="h-7 w-7 rounded-md border border-line text-bone-dim hover:border-sage hover:text-bone transition-colors"
          >
            −
          </button>
          <span className="fonte-display text-xl tabular-nums text-bone">
            {doses}
            <span className="text-bone-dim text-sm">×</span>
          </span>
          <span className="text-xl" title="Doses de Freio">
            💉
          </span>
          <button
            onClick={() => mudarDoses(doses + 1)}
            aria-label="Mais uma dose"
            className="h-7 w-7 rounded-md border border-line text-bone-dim hover:border-sage hover:text-bone transition-colors"
          >
            +
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
      {/* ============================ mapa ============================= */}
      <section className="flex-1 min-w-0 relative flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapa.arquivo}
          alt={`Mapa: ${mapa.nome}`}
          draggable={false}
          className="max-h-full max-w-full object-contain"
        />

        <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2">
          <span className="fonte-display uppercase tracking-[0.2em] text-lg text-bone drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {mapa.nome}
          </span>
        </div>

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

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[95%] overflow-x-auto">
          <div className="flex gap-1.5 rounded-full bg-ink/75 border border-line px-2 py-1.5 backdrop-blur">
            {MAPAS.map((m) => {
              const ativo = m.chave === mapa.chave;
              return (
                <button
                  key={m.chave}
                  onClick={() => setMapa(m)}
                  aria-pressed={ativo}
                  className={`fonte-display uppercase whitespace-nowrap rounded-full px-3 py-1 text-xs tracking-wide transition-colors ${
                    ativo ? "bg-sage/25 text-sage" : "text-bone-dim hover:text-bone"
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
      <aside className="shrink-0 w-[208px] border-l border-line overflow-y-auto px-2.5 py-2.5">
        {erro ? (
          <p className="text-center text-xs text-perigo">{erro}</p>
        ) : linhas.length === 0 ? (
          <p className="text-center text-xs text-bone-dim">
            {supabaseConfigurado
              ? "Ninguém entrou ainda."
              : "Banco não conectado."}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {linhas.map((l) => (
              <CartaoJogador
                key={l.jogador.id}
                linha={l}
                aoAbrirFicha={() => setFicha(l)}
                aoAbrirRetrato={() => setRetrato(l)}
              />
            ))}
          </div>
        )}
      </aside>
      </div>

      {ficha && <PainelFicha linha={ficha} aoFechar={() => setFicha(null)} />}

      {retrato && (
        <PainelRetrato
          linha={retrato}
          aoFechar={() => setRetrato(null)}
          aoSalvar={() => {
            setRetrato(null);
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
  aoAbrirFicha,
  aoAbrirRetrato,
}: {
  linha: LinhaMesa;
  aoAbrirFicha: () => void;
  aoAbrirRetrato: () => void;
}) {
  const p = linha.personagem;
  const botao = useRef<HTMLButtonElement>(null);
  const menuEl = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  function alternarMenu() {
    if (pos) return setPos(null);
    const r = botao.current?.getBoundingClientRect();
    if (!r) return;
    // posição fixa: o rodapé rola na horizontal e cortaria um menu absoluto
    setPos({
      left: Math.min(r.right - 160, window.innerWidth - 168),
      bottom: window.innerHeight - r.top + 6,
    });
  }

  useEffect(() => {
    if (!pos) return;
    // 'click' e não 'mousedown': mousedown dispara antes do clique do próprio
    // botão e fechava o menu no mesmo gesto que abriu
    const f = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (menuEl.current?.contains(alvo) || botao.current?.contains(alvo)) return;
      setPos(null);
    };
    document.addEventListener("click", f);
    return () => document.removeEventListener("click", f);
  }, [pos]);

  return (
    <div className="shrink-0 w-full">
      {/* retrato em destaque, visível sem abrir nada */}
      <button
        onClick={aoAbrirRetrato}
        title="Retrato"
        className="block w-full overflow-hidden rounded-xl border border-line
                   transition-colors hover:border-sage"
      >
        {p?.retrato_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.retrato_url}
            alt={p.nome || linha.jogador.nome}
            className="h-[132px] w-full object-cover"
          />
        ) : (
          <div className="h-[132px] w-full bg-surface/40 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-bone-dim/50">
              sem retrato
            </span>
          </div>
        )}
      </button>

      <div className="mt-1.5 rounded-xl border border-line bg-surface/50 px-2.5 py-2">
        <div className="flex items-start justify-between gap-1">
          <button
            onClick={aoAbrirFicha}
            title="Abrir ficha"
            className="fonte-display uppercase text-sm text-bone truncate text-left
                       hover:text-sage transition-colors"
          >
            {p?.nome?.trim() || linha.jogador.nome}
          </button>

          <button
            ref={botao}
            onClick={alternarMenu}
            aria-label="Opções"
            aria-expanded={!!pos}
            className="shrink-0 -mt-0.5 h-6 w-6 rounded text-bone-dim hover:text-bone transition-colors"
          >
            ⋯
          </button>
        </div>

        {p?.condicao && p.condicao !== "Normal" && (
          <span className="block text-[9px] uppercase text-perigo leading-tight">
            {p.condicao}
          </span>
        )}

        {!p ? (
          <p className="mt-1 text-[11px] text-bone-dim">Sem ficha</p>
        ) : (
          <div className="mt-1.5 grid grid-cols-2 gap-x-2.5 gap-y-1">
            {ESTADOS.map((e) => {
              const atual = p[e.chave] as number;
              const max = p[`${e.chave}_max` as keyof Personagem] as number;
              const pct = max > 0 ? Math.min(100, (atual / max) * 100) : 0;
              return (
                <div key={e.chave}>
                  <div className="flex justify-between text-[8px] uppercase text-bone-dim leading-none">
                    <span>{e.nome.slice(0, 4)}</span>
                    <span className="tabular-nums text-bone">{atual}</span>
                  </div>
                  <div className="mt-0.5 h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
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
      </div>

      {/* menu dos três pontos — fixo, para não ser cortado pelo rodapé */}
      {pos && (
        <div
          ref={menuEl}
          style={{ position: "fixed", left: pos.left, bottom: pos.bottom }}
          className="z-40 w-40 rounded-lg border border-line bg-ink shadow-xl overflow-hidden"
        >
          <button
            onClick={() => {
              setPos(null);
              aoAbrirFicha();
            }}
            className="block w-full px-3 py-2.5 text-left text-sm text-bone hover:bg-surface-2 transition-colors"
          >
            Ver ficha
          </button>
          <button
            onClick={() => {
              setPos(null);
              aoAbrirRetrato();
            }}
            className="block w-full px-3 py-2.5 text-left text-sm text-bone hover:bg-surface-2 transition-colors border-t border-line"
          >
            Retrato
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ painéis --------------------------------- */

function Moldura({
  titulo,
  subtitulo,
  aoFechar,
  children,
}: {
  titulo: string;
  subtitulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
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
              {subtitulo.toUpperCase()}
            </p>
            <h2 className="fonte-display uppercase text-bone text-2xl leading-none mt-1">
              {titulo}
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
        {children}
      </div>
    </div>
  );
}

function PainelRetrato({
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

  async function gravar() {
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

  return (
    <Moldura
      titulo={p?.nome?.trim() || linha.jogador.nome}
      subtitulo="Retrato"
      aoFechar={aoFechar}
    >
      {!p ? (
        <p className="mt-6 text-sm text-bone-dim">Sem ficha ainda.</p>
      ) : (
        <>
          <div className="mt-6 flex justify-center">
            {url.trim() ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={url}
                alt=""
                className="w-52 rounded-xl border border-line object-cover"
              />
            ) : (
              <div className="w-52 aspect-square rounded-xl border border-dashed border-line" />
            )}
          </div>

          {p.descricao_visual?.trim() && (
            <section className="mt-6">
              <h3 className="fonte-display uppercase text-xs tracking-[0.2em] text-rust mb-2">
                Descrição
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone-dim">
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
            </section>
          )}

          <div className="mt-6 flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/retratos/nome.png"
              className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-bone
                         placeholder:text-bone-dim/50 outline-none focus:border-sage"
            />
            <button
              onClick={gravar}
              disabled={salvando}
              className="fonte-display uppercase rounded-xl bg-rust px-5 py-2.5 text-sm text-bone disabled:opacity-30"
            >
              {salvando ? "…" : "Salvar"}
            </button>
          </div>
          {erro && <p className="mt-2 text-xs text-perigo">{erro}</p>}
        </>
      )}
    </Moldura>
  );
}

function PainelFicha({
  linha,
  aoFechar,
}: {
  linha: LinhaMesa;
  aoFechar: () => void;
}) {
  const p = linha.personagem;
  const esp = acharEspecializacao(p?.especializacao);

  return (
    <Moldura
      titulo={p?.nome?.trim() || "Sem personagem"}
      subtitulo={linha.jogador.nome}
      aoFechar={aoFechar}
    >
      {!p ? (
        <p className="mt-6 text-sm text-bone-dim">
          Esse jogador ainda não preencheu a ficha.
        </p>
      ) : (
        <>
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

          <Bloco titulo="Estado">
            <div className="grid grid-cols-3 gap-2 text-center">
              {ESTADOS.map((e) => (
                <div key={e.chave} className="rounded-lg border border-line py-2">
                  <div className="fonte-display text-lg text-bone">
                    {p[e.chave] as number}
                    <span className="text-bone-dim text-sm">
                      /{p[`${e.chave}_max` as keyof Personagem] as number}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase text-bone-dim">
                    {e.nome}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-bone-dim">
              Condição: <span className="text-bone">{p.condicao}</span>
            </p>
          </Bloco>

          <Bloco titulo="Inventário">
            <Linha
              rotulo="Arma"
              valor={`${p.arma || "—"}${
                p.arma ? (p.arma_barulhenta ? " (barulhenta)" : " (silenciosa)") : ""
              }`}
            />
            {p.itens?.trim() && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-bone">
                {p.itens}
              </p>
            )}
          </Bloco>

          <Bloco titulo="Perfil">
            <Linha rotulo="Qualidade" valor={p.qualidade} />
            <Linha rotulo="Defeito" valor={p.defeito} />
            <Linha rotulo="Maior medo" valor={p.maior_medo} />
            <Linha rotulo="Se acalma com" valor={p.como_se_acalma} />
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
    </Moldura>
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
