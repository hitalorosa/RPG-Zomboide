"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHAVE_ROSTO, FACCOES, type Rosto } from "@/lib/faccoes";
import { esconder, listarDescobertas, revelar } from "@/lib/descobertas";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaFaccoes() {
  const [reveladas, setReveladas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mestre, setMestre] = useState(false);
  const [aberto, setAberto] = useState<Rosto | null>(null);
  const [ocupadas, setOcupadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    listarDescobertas()
      .then(setReveladas)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  function aplicar(chave: string, revelado: boolean) {
    setReveladas((atual) => {
      const novo = new Set(atual);
      if (revelado) novo.add(chave);
      else novo.delete(chave);
      return novo;
    });
  }

  async function alternar(r: Rosto) {
    const chave = CHAVE_ROSTO(r.chave);
    if (ocupadas.has(chave)) return;
    const estava = reveladas.has(chave);

    setOcupadas((o) => new Set(o).add(chave));
    aplicar(chave, !estava);
    setErro(null);
    try {
      await (estava ? esconder(chave) : revelar(chave));
    } catch (e) {
      setErro((e as Error).message);
      aplicar(chave, estava);
    } finally {
      setOcupadas((o) => {
        const n = new Set(o);
        n.delete(chave);
        return n;
      });
    }
  }

  const todos = FACCOES.flatMap((f) => f.rostos);
  const conhecidos = todos.filter((r) =>
    reveladas.has(CHAVE_ROSTO(r.chave))
  ).length;

  return (
    <main className="min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/mesa"
              className="fonte-display text-xs tracking-[0.3em] text-rust hover:text-bone transition-colors"
            >
              ‹ A MESA
            </Link>
            <h1 className="fonte-display uppercase text-bone text-3xl sm:text-4xl leading-none mt-1">
              Facções conhecidas
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <span className="fonte-display text-2xl tabular-nums text-bone">
              {conhecidos}
              <span className="text-bone-dim"> / {todos.length}</span>
              <span className="ml-2 text-xs uppercase tracking-wider text-bone-dim">
                conhecidos
              </span>
            </span>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mestre}
                onChange={(e) => setMestre(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-rust)]"
              />
              <span className="text-xs uppercase tracking-wider text-bone-dim">
                Modo narrador
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-line" />

        {erro && <p className="mt-4 text-sm text-perigo">{erro}</p>}
        {!supabaseConfigurado && (
          <p className="mt-4 text-xs text-bone-dim/70">
            Banco não conectado — as revelações valem só neste navegador.
          </p>
        )}

        {carregando ? (
          <p className="mt-10 text-sm text-bone-dim">Carregando…</p>
        ) : (
          FACCOES.map((f) => {
            const algumVisivel = f.rostos.some((r) =>
              reveladas.has(CHAVE_ROSTO(r.chave))
            );
            return (
              <section key={f.chave} className="mt-12">
                <h2 className="fonte-display uppercase text-bone text-2xl leading-none">
                  {algumVisivel ? (
                    f.nome
                  ) : (
                    <span className="inline-block h-6 w-52 rounded-sm bg-bone/85 align-middle" />
                  )}
                </h2>
                {algumVisivel && (
                  <>
                    <p className="mt-2 text-sm text-bone-dim max-w-2xl">
                      {f.resumo}
                    </p>
                    <p className="mt-1 text-xs italic text-sage">
                      {f.sobrevive}
                    </p>
                  </>
                )}

                <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {f.rostos.map((r) => {
                    const chave = CHAVE_ROSTO(r.chave);
                    const vivo = reveladas.has(chave);
                    return (
                      <li key={r.chave}>
                        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/40">
                          <button
                            type="button"
                            onClick={() => vivo && setAberto(r)}
                            disabled={!vivo}
                            className={`block w-full aspect-square ${
                              vivo ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            {vivo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={r.arquivo}
                                alt={r.nome}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#08090a]">
                                <span className="fonte-display text-3xl text-bone-dim/25">
                                  ?
                                </span>
                              </div>
                            )}
                          </button>

                          <div className="border-t border-line px-3 py-2.5">
                            {vivo ? (
                              <p className="fonte-display uppercase text-bone truncate">
                                {r.nome}
                              </p>
                            ) : (
                              <p className="h-[1.15rem] w-full rounded-sm bg-bone/85" />
                            )}
                            <p className="mt-1 text-[10px] uppercase tracking-wider text-bone-dim">
                              {vivo ? r.papel : "Não conhecido"}
                            </p>
                          </div>

                          {mestre && (
                            <button
                              type="button"
                              disabled={ocupadas.has(chave)}
                              onClick={() => alternar(r)}
                              className={`absolute top-2 right-2 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider
                                          backdrop-blur transition-colors ${
                                            vivo
                                              ? "bg-ink/80 text-bone-dim hover:text-perigo"
                                              : "bg-rust/90 text-bone hover:bg-rust"
                                          }`}
                            >
                              {vivo ? "Esconder" : "Revelar"}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>

      {aberto && (
        <div
          onClick={() => setAberto(null)}
          className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/80 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl
                       border border-line bg-ink"
          >
            <div className="sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={aberto.arquivo}
                alt={aberto.nome}
                className="w-full sm:w-1/2 object-cover"
              />
              <div className="p-6 sm:w-1/2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="fonte-display text-xs tracking-[0.3em] text-rust">
                      {aberto.papel.toUpperCase()}
                    </p>
                    <h2 className="fonte-display uppercase text-bone text-3xl leading-none mt-1">
                      {aberto.nome}
                    </h2>
                  </div>
                  <button
                    onClick={() => setAberto(null)}
                    aria-label="Fechar"
                    className="shrink-0 text-bone-dim hover:text-bone text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-bone">
                  {aberto.sobre}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
