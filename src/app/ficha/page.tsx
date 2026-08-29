"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { encerrarSessao, lerSessao, type Jogador } from "@/lib/jogadores";

export default function PaginaFicha() {
  const router = useRouter();
  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const sessao = lerSessao();
    if (!sessao) {
      router.replace("/");
      return;
    }
    setJogador(sessao);
    setVerificado(true);
  }, [router]);

  if (!verificado || !jogador) return null;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl text-center">
        <p className="fonte-display text-xs sm:text-sm tracking-[0.35em] text-rust mb-3">
          SOBREVIVENTE
        </p>

        <h1 className="fonte-display uppercase text-bone text-[2rem] sm:text-5xl leading-none">
          {jogador.nome}
        </h1>

        <div className="mx-auto mt-5 h-px w-24 bg-rust/70" />

        <p className="mt-8 text-sm leading-relaxed text-bone-dim">
          Você entrou. A ficha ainda não existe — é a próxima etapa.
        </p>

        <button
          onClick={() => {
            encerrarSessao();
            router.replace("/");
          }}
          className="fonte-display uppercase tracking-wide mt-10 rounded-xl border border-line px-6 py-3
                     text-bone-dim transition-colors hover:border-sage hover:text-bone"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
