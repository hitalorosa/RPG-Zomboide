"use client";

import { useEffect, useState } from "react";
import {
  listarMesa,
  salvarPersonagem,
  type LinhaMesa,
  type Personagem,
} from "@/lib/personagens";
import { acharEspecializacao, ATRIBUTOS, ESTADOS } from "@/lib/regras";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaMesa() {
  const [linhas, setLinhas] = useState<LinhaMesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<LinhaMesa | null>(null);

  function recarregar() {
    listarMesa()
      .then(setLinhas)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(recarregar, []);

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <p className="fonte-display text-xs tracking-[0.3em] text-rust">
          NARRADOR
        </p>
        <h1 className="fonte-display uppercase text-bone text-3xl sm:text-4xl leading-none mt-1">
          A mesa
        </h1>
        <div className="mt-4 h-px w-full bg-line" />

        {erro && <p className="mt-6 text-sm text-perigo">{erro}</p>}

        {carregando ? (
          <p className="mt-8 text-sm text-bone-dim">Carregando…</p>
        ) : linhas.length === 0 ? (
          <p className="mt-8 text-sm text-bone-dim">
            Ninguém entrou ainda.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-line rounded-xl border border-line overflow-hidden">
            {linhas.map((l) => {
              const esp = acharEspecializacao(l.personagem?.especializacao);
              return (
                <li
                  key={l.jogador.id}
                  className="flex items-center gap-4 bg-surface/40 px-4 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="fonte-display uppercase text-bone truncate">
                      {l.personagem?.nome?.trim() || l.jogador.nome}
                    </p>
                    <p className="text-xs text-bone-dim truncate">
                      {l.jogador.nome}
                      {esp ? ` · ${esp.nome}` : " · sem ficha"}
                      {l.personagem?.condicao &&
                      l.personagem.condicao !== "Normal"
                        ? ` · ${l.personagem.condicao}`
                        : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => setAberto(l)}
                    aria-label={`Abrir ficha de ${l.jogador.nome}`}
                    className="shrink-0 h-10 w-10 rounded-lg border border-line text-bone-dim
                               transition-colors hover:border-sage hover:text-bone"
                  >
                    ⋯
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!supabaseConfigurado && (
          <p className="mt-8 text-xs text-bone-dim/70">
            Banco não conectado — só aparece quem entrou neste navegador.
          </p>
        )}
      </div>

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
    </main>
  );
}

/* ------------------------------- painel ------------------------------- */

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
      className="fixed inset-0 z-20 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-6"
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
            {/* --------------------- descrição visual -------------------- */}
            <Bloco titulo="Descrição visual">
              {p.descricao_visual?.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone">
                  {p.descricao_visual}
                </p>
              ) : (
                <p className="text-sm text-bone-dim">Não preencheu.</p>
              )}

              {p.descricao_visual?.trim() && (
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(p.descricao_visual)
                  }
                  className="mt-3 text-xs uppercase tracking-wider text-bone-dim hover:text-sage transition-colors"
                >
                  Copiar descrição
                </button>
              )}
            </Bloco>

            {/* -------------------------- retrato ------------------------ */}
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
                  placeholder="Colar link da imagem gerada"
                  className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-bone
                             placeholder:text-bone-dim/50 outline-none focus:border-sage"
                />
                <button
                  onClick={gravarRetrato}
                  disabled={salvando}
                  className="fonte-display uppercase rounded-xl bg-rust px-4 py-2.5 text-sm text-bone
                             disabled:opacity-30"
                >
                  {salvando ? "…" : "Salvar"}
                </button>
              </div>
              {erro && <p className="mt-2 text-xs text-perigo">{erro}</p>}
            </Bloco>

            {/* ------------------------- atributos ----------------------- */}
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

            {/* --------------------------- estado ------------------------ */}
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

            {/* --------------------------- perfil ------------------------ */}
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
