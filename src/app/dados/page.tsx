"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DADOS,
  descreverFormula,
  gravarRolagem,
  limparRolagens,
  listarRolagens,
  rolar,
  totalizar,
  type Rolagem,
} from "@/lib/dados";
import { listarMesa } from "@/lib/personagens";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaDados() {
  const [quem, setQuem] = useState("");
  const [pessoas, setPessoas] = useState<string[]>([]);
  const [lados, setLados] = useState(20);
  const [quantidade, setQuantidade] = useState(1);
  const [modificador, setModificador] = useState(0);
  const [vantagem, setVantagem] = useState(false);
  const [rotulo, setRotulo] = useState("");
  const [historico, setHistorico] = useState<Rolagem[]>([]);
  const [ultima, setUltima] = useState<Rolagem | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    listarRolagens()
      .then(setHistorico)
      .catch((e: Error) => setErro(e.message));
  }, []);

  useEffect(() => {
    listarMesa()
      .then((linhas) => {
        const nomes = linhas.map(
          (l) => l.personagem?.nome?.trim() || l.jogador.nome
        );
        setPessoas(["Narrador", ...nomes]);
        try {
          const salvo = window.localStorage.getItem("zomboide:quem-rola");
          setQuem(salvo && [...nomes, "Narrador"].includes(salvo) ? salvo : "Narrador");
        } catch {
          setQuem("Narrador");
        }
      })
      .catch(() => {
        setPessoas(["Narrador"]);
        setQuem("Narrador");
      });
    recarregar();
  }, [recarregar]);

  // mantém o histórico vivo entre aparelhos
  useEffect(() => {
    if (!supabaseConfigurado) return;
    const t = setInterval(recarregar, 3000);
    return () => clearInterval(t);
  }, [recarregar]);

  function escolherQuem(n: string) {
    setQuem(n);
    try {
      window.localStorage.setItem("zomboide:quem-rola", n);
    } catch {}
  }

  async function jogar() {
    setErro(null);
    const resultados = rolar(lados, quantidade, vantagem);
    const total = totalizar(resultados, modificador, vantagem);
    const r: Rolagem = {
      quem: quem || "Narrador",
      rotulo: rotulo.trim(),
      formula: descreverFormula(lados, quantidade, vantagem, modificador),
      resultados,
      modificador,
      total,
    };
    setUltima(r);
    setHistorico((h) => [{ ...r, criado_em: new Date().toISOString() }, ...h]);
    try {
      await gravarRolagem(r);
      recarregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const critico =
    lados === 20 && ultima?.resultados.some((v) => v === 20) ? "alto" :
    lados === 20 && ultima?.resultados.every((v) => v === 1) ? "baixo" : null;

  return (
    <main className="min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/mesa"
          className="fonte-display text-xs tracking-[0.3em] text-rust hover:text-bone transition-colors"
        >
          ‹ A MESA
        </Link>
        <h1 className="fonte-display uppercase text-bone text-3xl sm:text-4xl leading-none mt-1">
          Dados
        </h1>
        <div className="mt-4 h-px w-full bg-line" />

        {/* --------------------------- quem rola -------------------------- */}
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wider text-bone-dim mb-2">
            Quem vai girar
          </p>
          <div className="flex flex-wrap gap-2">
            {pessoas.map((n) => (
              <button
                key={n}
                onClick={() => escolherQuem(n)}
                aria-pressed={quem === n}
                className={`fonte-display uppercase rounded-lg border px-3.5 py-2 text-sm transition-colors ${
                  quem === n
                    ? "border-sage bg-surface-2 text-sage"
                    : "border-line bg-surface text-bone hover:border-sage/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* ----------------------------- o dado --------------------------- */}
        <section className="mt-8">
          <p className="text-xs uppercase tracking-wider text-bone-dim mb-2">
            Dado
          </p>
          <div className="flex flex-wrap gap-2">
            {DADOS.map((d) => (
              <button
                key={d}
                onClick={() => setLados(d)}
                aria-pressed={lados === d}
                className={`fonte-display rounded-lg border px-4 py-2.5 text-base transition-colors ${
                  lados === d
                    ? "border-sage bg-surface-2 text-sage"
                    : "border-line bg-surface text-bone hover:border-sage/50"
                }`}
              >
                d{d}
              </button>
            ))}
          </div>
        </section>

        {/* --------------------------- ajustes ---------------------------- */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Passo
            rotulo="Quantidade"
            valor={quantidade}
            aoMudar={(v) => setQuantidade(Math.max(1, Math.min(10, v)))}
            desativado={vantagem}
          />
          <Passo
            rotulo="Modificador"
            valor={modificador}
            aoMudar={(v) => setModificador(Math.max(-10, Math.min(20, v)))}
            sinal
          />
          <label className="flex items-end pb-2">
            <span className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vantagem}
                onChange={(e) => setVantagem(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-rust)]"
              />
              <span className="text-sm text-bone">
                Especialização
                <span className="block text-[11px] text-bone-dim">
                  2 dados, usa o maior
                </span>
              </span>
            </span>
          </label>
        </section>

        <input
          value={rotulo}
          onChange={(e) => setRotulo(e.target.value)}
          placeholder="Pra quê? (furtividade, luta, convencer...)"
          maxLength={40}
          className="mt-4 w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone
                     placeholder:text-bone-dim/50 outline-none focus:border-sage"
        />

        <button
          onClick={jogar}
          className="fonte-display uppercase tracking-wide mt-4 w-full rounded-xl bg-rust py-4 text-xl text-bone
                     transition-opacity hover:opacity-90"
        >
          Girar {descreverFormula(lados, quantidade, vantagem, modificador)}
        </button>

        {/* -------------------------- resultado --------------------------- */}
        {ultima && (
          <div
            className={`mt-6 rounded-2xl border p-6 text-center ${
              critico === "alto"
                ? "border-sage bg-sage/10"
                : critico === "baixo"
                  ? "border-perigo bg-perigo/10"
                  : "border-line bg-surface/50"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-bone-dim">
              {ultima.quem}
              {ultima.rotulo && ` · ${ultima.rotulo}`}
            </p>
            <p className="fonte-display text-6xl text-bone leading-none mt-2">
              {ultima.total}
            </p>
            <p className="mt-2 text-sm text-bone-dim">
              {ultima.formula} · saiu [{ultima.resultados.join(", ")}]
            </p>
            {critico === "alto" && (
              <p className="fonte-display uppercase text-sage mt-2">
                20 natural
              </p>
            )}
            {critico === "baixo" && (
              <p className="fonte-display uppercase text-perigo mt-2">
                1 natural
              </p>
            )}
          </div>
        )}

        {erro && <p className="mt-4 text-sm text-perigo">{erro}</p>}
        {!supabaseConfigurado && (
          <p className="mt-4 text-xs text-bone-dim/70">
            Banco não conectado, o histórico fica só neste navegador.
          </p>
        )}

        {/* -------------------------- histórico --------------------------- */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="fonte-display uppercase text-sm tracking-[0.2em] text-rust">
              Rolagens da rodada
            </h2>
            {historico.length > 0 && (
              <button
                onClick={async () => {
                  await limparRolagens();
                  setHistorico([]);
                  setUltima(null);
                }}
                className="text-xs uppercase tracking-wider text-bone-dim hover:text-perigo transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {historico.length === 0 ? (
            <p className="mt-4 text-sm text-bone-dim">Ninguém girou ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line overflow-hidden">
              {historico.map((r, i) => (
                <li
                  key={r.id ?? i}
                  className="flex items-center gap-3 bg-surface/40 px-4 py-2.5"
                >
                  <span className="fonte-display w-12 shrink-0 text-2xl tabular-nums text-bone text-right">
                    {r.total}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-bone truncate">
                      {r.quem}
                      {r.rotulo && (
                        <span className="text-bone-dim"> · {r.rotulo}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-bone-dim">
                      {r.formula} · [{r.resultados.join(", ")}]
                    </p>
                  </div>
                  {r.criado_em && (
                    <span className="shrink-0 text-[10px] text-bone-dim/60 tabular-nums">
                      {new Date(r.criado_em).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Passo({
  rotulo,
  valor,
  aoMudar,
  sinal,
  desativado,
}: {
  rotulo: string;
  valor: number;
  aoMudar: (v: number) => void;
  sinal?: boolean;
  desativado?: boolean;
}) {
  const botao =
    "h-11 w-11 shrink-0 rounded-lg border border-line bg-surface text-xl text-bone " +
    "transition-colors hover:border-sage disabled:opacity-25";
  return (
    <div className={desativado ? "opacity-40 pointer-events-none" : ""}>
      <p className="text-xs uppercase tracking-wider text-bone-dim mb-1.5">
        {rotulo}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => aoMudar(valor - 1)} className={botao}>
          −
        </button>
        <span className="fonte-display flex-1 text-center text-2xl tabular-nums text-bone">
          {sinal && valor > 0 ? "+" : ""}
          {valor}
        </span>
        <button onClick={() => aoMudar(valor + 1)} className={botao}>
          +
        </button>
      </div>
    </div>
  );
}
