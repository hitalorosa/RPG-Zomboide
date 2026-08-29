"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { encerrarSessao, lerSessao, type Jogador } from "@/lib/jogadores";
import { carregarPersonagem, type Personagem } from "@/lib/personagens";
import {
  acharEspecializacao,
  ATRIBUTOS,
  ESTADOS,
  type ChaveEstado,
} from "@/lib/regras";

/** Cada barra tem cor própria — dá pra ler o estado sem ler o rótulo. */
const COR_ESTADO: Record<ChaveEstado, string> = {
  vida: "var(--color-rust)",
  sanidade: "var(--color-sage)",
  medo: "var(--color-ochre)",
  panico: "var(--color-perigo)",
  estresse: "var(--color-ochre)",
  fadiga: "var(--color-bone-dim)",
};

export default function PaginaPersonagem() {
  const router = useRouter();
  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [p, setP] = useState<Personagem | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const sessao = lerSessao();
    if (!sessao) {
      router.replace("/");
      return;
    }
    setJogador(sessao);
    carregarPersonagem(sessao.id)
      .then((f) => {
        if (!f) router.replace("/ficha");
        else setP(f);
      })
      .catch(() => router.replace("/ficha"))
      .finally(() => setCarregando(false));
  }, [router]);

  if (carregando || !p || !jogador) return null;

  const esp = acharEspecializacao(p.especializacao);
  const itens = p.itens.split("\n").map((i) => i.trim()).filter(Boolean);

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* --------------------------- cabeçalho -------------------------- */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="fonte-display text-xs tracking-[0.3em] text-rust">
              {jogador.nome.toUpperCase()}
            </p>
            <h1 className="fonte-display uppercase text-bone text-3xl sm:text-5xl leading-none mt-1 break-words">
              {p.nome?.trim() || "Sem nome"}
            </h1>
            <p className="mt-2 text-sm text-bone-dim">
              {[
                esp?.nome,
                p.idade && `${p.idade} anos`,
                p.pronomes,
                p.profissao_antes,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <button
            onClick={() => {
              encerrarSessao();
              router.replace("/");
            }}
            className="shrink-0 text-xs uppercase tracking-wider text-bone-dim hover:text-bone transition-colors"
          >
            Sair
          </button>
        </div>

        {/* ---------------------------- retrato --------------------------- */}
        <div className="mt-8 flex justify-center">
          {p.retrato_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.retrato_url}
              alt={`Retrato de ${p.nome}`}
              className="w-56 sm:w-64 rounded-2xl border border-line object-cover"
            />
          ) : (
            <div className="w-56 sm:w-64 aspect-square rounded-2xl border border-dashed border-line bg-surface/40 flex items-center justify-center px-6">
              <p className="text-center text-xs leading-relaxed text-bone-dim/70">
                O retrato aparece aqui
                <br />
                quando o narrador anexar.
              </p>
            </div>
          )}
        </div>

        {/* ---------------------------- estado ---------------------------- */}
        <Bloco titulo="Estado">
          <div className="grid gap-3 sm:grid-cols-2">
            {ESTADOS.map((e) => {
              const atual = p[e.chave] as number;
              const max = p[`${e.chave}_max` as keyof Personagem] as number;
              const pct = max > 0 ? Math.min(100, (atual / max) * 100) : 0;
              return (
                <div key={e.chave}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs uppercase tracking-wider text-bone-dim">
                      {e.nome}
                    </span>
                    <span className="fonte-display text-sm tabular-nums text-bone">
                      {atual}
                      <span className="text-bone-dim">/{max}</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-[width]"
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

          {p.condicao !== "Normal" && (
            <p className="mt-4 inline-block rounded-lg border border-perigo/60 px-3 py-1.5 text-sm text-perigo">
              {p.condicao}
            </p>
          )}
        </Bloco>

        {/* --------------------------- atributos -------------------------- */}
        <Bloco titulo="Atributos">
          <div className="grid grid-cols-5 gap-2">
            {ATRIBUTOS.map((a) => {
              const bonus = p.atributo_bonus === a.chave ? 1 : 0;
              return (
                <div
                  key={a.chave}
                  className="rounded-xl border border-line bg-surface/40 py-3 text-center"
                >
                  <div
                    className={`fonte-display text-2xl ${bonus ? "text-sage" : "text-bone"}`}
                  >
                    {(p[a.chave] as number) + bonus}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-bone-dim mt-0.5">
                    {a.nome}
                  </div>
                </div>
              );
            })}
          </div>
          {esp && (
            <p className="mt-3 text-xs leading-relaxed text-bone-dim">
              <span className="text-sage">{esp.nome}</span> — {esp.descricao}
            </p>
          )}
        </Bloco>

        {/* --------------------------- inventário ------------------------- */}
        <Bloco titulo="Inventário">
          <div className="rounded-xl border border-line bg-surface/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-bone">
                {p.arma?.trim() || "Sem arma"}
              </span>
              {p.arma?.trim() && (
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    p.arma_barulhenta
                      ? "bg-perigo/20 text-perigo"
                      : "bg-sage/15 text-sage"
                  }`}
                >
                  {p.arma_barulhenta ? "Barulhenta" : "Silenciosa"}
                </span>
              )}
            </div>
          </div>

          {itens.length > 0 ? (
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {itens.map((i, n) => (
                <li
                  key={n}
                  className="rounded-lg border border-line bg-surface/30 px-3 py-2 text-sm text-bone"
                >
                  {i}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-bone-dim">Mochila vazia.</p>
          )}
        </Bloco>

        {/* ----------------------------- perfil --------------------------- */}
        <Bloco titulo="Perfil">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item rotulo="Qualidade" valor={p.qualidade} />
            <Item rotulo="Defeito" valor={p.defeito} />
            <Item rotulo="Maior medo" valor={p.maior_medo} />
            <Item rotulo="Se acalma com" valor={p.como_se_acalma} />
          </dl>
        </Bloco>

        {p.descricao_visual?.trim() && (
          <Bloco titulo="Aparência">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone-dim">
              {p.descricao_visual}
            </p>
          </Bloco>
        )}

        {p.historia?.trim() && (
          <Bloco titulo="História">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone">
              {p.historia}
            </p>
          </Bloco>
        )}

        {/* ----------------------------- editar --------------------------- */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/ficha")}
            className="fonte-display uppercase tracking-wide rounded-xl border border-line px-8 py-3
                       text-bone-dim transition-colors hover:border-sage hover:text-bone"
          >
            Editar ficha
          </button>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------ auxiliares ----------------------------- */

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="fonte-display uppercase text-sm tracking-[0.2em] text-rust">
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/40 px-4 py-3">
      <dt className="text-[10px] uppercase tracking-wider text-bone-dim">
        {rotulo}
      </dt>
      <dd className="mt-1 text-sm text-bone">{valor?.trim() || "—"}</dd>
    </div>
  );
}
