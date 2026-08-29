"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  entrarComoJogador,
  listarJogadores,
  salvarSessao,
  type Jogador,
} from "@/lib/jogadores";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaEntrada() {
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [entrando, setEntrando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarJogadores()
      .then(setJogadores)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(nomeEscolhido: string) {
    setErro(null);
    setEntrando(nomeEscolhido);
    try {
      const jogador = await entrarComoJogador(nomeEscolhido);
      salvarSessao(jogador);
      router.push("/ficha");
    } catch (e) {
      setErro((e as Error).message);
      setEntrando(null);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl">
        <p className="fonte-display text-center text-xs sm:text-sm tracking-[0.35em] text-rust mb-3">
          RPG ZOMBOIDE
        </p>

        <h1 className="fonte-display text-center uppercase text-bone leading-[0.95] text-[2rem] sm:text-5xl">
          Quem vai entrar
          <br />
          na jornada?
        </h1>

        <div className="mx-auto mt-5 h-px w-24 bg-rust/70" />

        {/* ---------------------------- lista ---------------------------- */}
        <section className="mt-10">
          {carregando ? (
            <p className="text-center text-sm text-bone-dim">Carregando…</p>
          ) : jogadores.length === 0 ? (
            <p className="text-center text-sm text-bone-dim">
              Ninguém entrou ainda. Seja o primeiro.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {jogadores.map((j) => (
                <li key={j.id}>
                  <button
                    onClick={() => entrar(j.nome)}
                    disabled={entrando !== null}
                    className="group w-full aspect-square rounded-2xl border border-line bg-surface
                               flex items-center justify-center px-3
                               transition-colors
                               hover:border-sage hover:bg-surface-2
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="fonte-display uppercase text-lg sm:text-xl text-bone break-words text-center group-hover:text-sage transition-colors">
                      {entrando === j.nome ? "…" : j.nome}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ------------------------- entrar novo ------------------------- */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nome.trim()) entrar(nome);
          }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={24}
            placeholder="Entrar com outro nome"
            aria-label="Seu nome"
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-3
                       text-bone placeholder:text-bone-dim/60
                       focus:border-sage outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!nome.trim() || entrando !== null}
            className="fonte-display uppercase tracking-wide rounded-xl px-7 py-3
                       bg-rust text-bone
                       transition-opacity hover:opacity-90
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
        </form>

        {erro && (
          <p className="mt-4 text-center text-sm text-perigo" role="alert">
            {erro}
          </p>
        )}

        {!supabaseConfigurado && (
          <p className="mt-10 text-center text-xs leading-relaxed text-bone-dim/70">
            Banco de dados ainda não conectado — os nomes estão sendo salvos
            só neste navegador.
          </p>
        )}
      </div>
    </main>
  );
}
