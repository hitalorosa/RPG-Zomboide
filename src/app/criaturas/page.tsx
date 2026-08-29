"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHAVE_CRIATURA, CRIATURAS, type Criatura } from "@/lib/criaturas";
import { esconder, listarDescobertas, revelar } from "@/lib/descobertas";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaCriaturas() {
  const [reveladas, setReveladas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mestre, setMestre] = useState(false);
  const [aberta, setAberta] = useState<Criatura | null>(null);

  useEffect(() => {
    listarDescobertas()
      .then(setReveladas)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function alternar(c: Criatura) {
    const chave = CHAVE_CRIATURA(c.chave);
    const estava = reveladas.has(chave);
    // atualiza na hora e desfaz se o banco recusar
    const novo = new Set(reveladas);
    if (estava) novo.delete(chave);
    else novo.add(chave);
    setReveladas(novo);
    try {
      await (estava ? esconder(chave) : revelar(chave));
    } catch (e) {
      setErro((e as Error).message);
      setReveladas(reveladas);
    }
  }

  const total = CRIATURAS.length;
  const conhecidas = CRIATURAS.filter((c) =>
    reveladas.has(CHAVE_CRIATURA(c.chave))
  ).length;

  return (
    <main className="min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* --------------------------- cabeçalho -------------------------- */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/mesa"
              className="fonte-display text-xs tracking-[0.3em] text-rust hover:text-bone transition-colors"
            >
              ‹ A MESA
            </Link>
            <h1 className="fonte-display uppercase text-bone text-3xl sm:text-4xl leading-none mt-1">
              Criaturas
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <span className="fonte-display text-2xl tabular-nums text-bone">
              {conhecidas}
              <span className="text-bone-dim"> / {total}</span>
              <span className="ml-2 text-xs uppercase tracking-wider text-bone-dim">
                catalogadas
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

        {/* ----------------------------- grade ---------------------------- */}
        {carregando ? (
          <p className="mt-10 text-sm text-bone-dim">Carregando…</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CRIATURAS.map((c, i) => {
              const viva = reveladas.has(CHAVE_CRIATURA(c.chave));
              return (
                <li key={c.chave}>
                  <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/40">
                    <button
                      onClick={() => viva && setAberta(c)}
                      disabled={!viva}
                      className={`block w-full aspect-square ${
                        viva ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      {viva ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={c.arquivo}
                          alt={c.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#08090a]">
                          <span className="fonte-display text-4xl text-bone-dim/25">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="border-t border-line px-3 py-2.5">
                      {viva ? (
                        <p className="fonte-display uppercase text-bone truncate">
                          {c.nome}
                        </p>
                      ) : (
                        // tarja de censura
                        <p className="h-[1.15rem] w-full rounded-sm bg-bone/85" />
                      )}
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-bone-dim">
                        {viva ? c.licao.split(":")[0] : "Não catalogado"}
                      </p>
                    </div>

                    {mestre && (
                      <button
                        onClick={() => alternar(c)}
                        className={`absolute top-2 right-2 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider
                                    backdrop-blur transition-colors ${
                                      viva
                                        ? "bg-ink/80 text-bone-dim hover:text-perigo"
                                        : "bg-rust/90 text-bone hover:bg-rust"
                                    }`}
                      >
                        {viva ? "Esconder" : "Revelar"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---------------------------- detalhe ---------------------------- */}
      {aberta && (
        <div
          onClick={() => setAberta(null)}
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
                src={aberta.arquivo}
                alt={aberta.nome}
                className="w-full sm:w-1/2 object-cover"
              />
              <div className="p-6 sm:w-1/2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="fonte-display uppercase text-bone text-3xl leading-none">
                    {aberta.nome}
                  </h2>
                  <button
                    onClick={() => setAberta(null)}
                    aria-label="Fechar"
                    className="shrink-0 text-bone-dim hover:text-bone text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-3 text-sm italic text-sage">{aberta.licao}</p>

                <Campo titulo="O que ele lê" texto={aberta.le} />
                <Campo titulo="O que ele pune" texto={aberta.pune} />
                <Campo titulo="Como se lida" texto={aberta.contra} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Campo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="mt-5">
      <h3 className="fonte-display uppercase text-xs tracking-[0.2em] text-rust">
        {titulo}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-bone">{texto}</p>
    </section>
  );
}
