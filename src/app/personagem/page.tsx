"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { lerSessao, type Jogador } from "@/lib/jogadores";
import {
  carregarPersonagem,
  personagemVazio,
  salvarPersonagem,
  type Personagem,
} from "@/lib/personagens";
import {
  aparenciaAleatoria,
  GRUPOS,
  type Aparencia,
} from "@/lib/aparencia";
import { Avatar } from "@/components/avatar";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaPersonagem() {
  const router = useRouter();
  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [p, setP] = useState<Personagem | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const sessao = lerSessao();
    if (!sessao) {
      router.replace("/");
      return;
    }
    setJogador(sessao);
    carregarPersonagem(sessao.id)
      .then((existente) => setP(existente ?? personagemVazio(sessao.id)))
      .catch((e: Error) => {
        setErro(e.message);
        setP(personagemVazio(sessao.id));
      })
      .finally(() => setCarregando(false));
  }, [router]);

  function mudarAparencia(campo: keyof Aparencia, valor: string) {
    setP((a) =>
      a ? { ...a, aparencia: { ...a.aparencia, [campo]: valor } } : a
    );
  }

  async function continuar() {
    if (!p) return;
    setErro(null);
    setSalvando(true);
    try {
      const salvo = await salvarPersonagem(p);
      setP(salvo);
      router.push("/ficha");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando || !p || !jogador) return null;

  return (
    <main className="flex-1 pb-32">
      {/* ------------------- retrato, fixo no topo ------------------- */}
      <div className="sticky top-0 z-10 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-5 pt-6 pb-4">
          <p className="fonte-display text-center text-xs tracking-[0.3em] text-rust">
            {jogador.nome.toUpperCase()}
          </p>
          <h1 className="fonte-display text-center uppercase text-bone text-2xl sm:text-3xl leading-none mt-1">
            Faça seu personagem
          </h1>

          <div className="mt-4 flex justify-center">
            <Avatar a={p.aparencia} className="h-44 w-44 sm:h-52 sm:w-52" />
          </div>

          <div className="mt-2 flex justify-center">
            <button
              onClick={() =>
                setP((a) => (a ? { ...a, aparencia: aparenciaAleatoria() } : a))
              }
              className="text-xs uppercase tracking-wider text-bone-dim transition-colors hover:text-sage"
            >
              Sortear aparência
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------- opções -------------------------- */}
      <div className="mx-auto w-full max-w-2xl px-5">
        {GRUPOS.map((g) => (
          <section key={g.campo} className="mt-8">
            <h2 className="fonte-display uppercase text-xs tracking-[0.2em] text-rust">
              {g.titulo}
            </h2>

            {g.tipo === "cor" ? (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {g.cores.map((cor) => {
                  const ativo = p.aparencia[g.campo as keyof Aparencia] === cor;
                  return (
                    <button
                      key={cor}
                      onClick={() =>
                        mudarAparencia(g.campo as keyof Aparencia, cor)
                      }
                      aria-label={`${g.titulo}: ${cor}`}
                      aria-pressed={ativo}
                      style={{ backgroundColor: cor }}
                      className={`h-11 w-11 rounded-full border-2 transition-transform ${
                        ativo
                          ? "border-sage scale-110"
                          : "border-line hover:scale-105"
                      }`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {g.opcoes.map((o) => {
                  const ativo =
                    p.aparencia[g.campo as keyof Aparencia] === o.chave;
                  return (
                    <button
                      key={o.chave}
                      onClick={() =>
                        mudarAparencia(g.campo as keyof Aparencia, o.chave)
                      }
                      aria-pressed={ativo}
                      className={`rounded-lg border px-3.5 py-2 text-sm transition-colors ${
                        ativo
                          ? "border-sage bg-surface-2 text-sage"
                          : "border-line bg-surface text-bone hover:border-sage/50"
                      }`}
                    >
                      {o.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        {!supabaseConfigurado && (
          <p className="mt-10 text-center text-xs text-bone-dim/70">
            Banco não conectado — salvo só neste navegador.
          </p>
        )}
      </div>

      {/* -------------------------- barra fixa ----------------------- */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 backdrop-blur px-5 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-4">
          <span className="flex-1 text-xs text-bone-dim" aria-live="polite">
            {erro ? <span className="text-perigo">{erro}</span> : null}
          </span>
          <button
            onClick={continuar}
            disabled={salvando}
            className="fonte-display uppercase tracking-wide rounded-xl bg-rust px-8 py-3 text-bone
                       transition-opacity hover:opacity-90
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando…" : "Continuar"}
          </button>
        </div>
      </div>
    </main>
  );
}
