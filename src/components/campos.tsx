"use client";

import type { ReactNode } from "react";

const baseCampo =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone " +
  "placeholder:text-bone-dim/50 outline-none transition-colors focus:border-sage";

export function Secao({
  titulo,
  aviso,
  children,
}: {
  titulo: string;
  aviso?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="fonte-display uppercase text-sm tracking-[0.2em] text-rust">
        {titulo}
      </h2>
      {aviso && (
        <p className="mt-1 text-xs leading-relaxed text-bone-dim/70">{aviso}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Campo({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  maxLength = 80,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-bone-dim mb-1.5">
        {rotulo}
      </span>
      <input
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        className={baseCampo}
      />
    </label>
  );
}

export function Area({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  linhas = 4,
  maxLength = 2000,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  linhas?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-bone-dim mb-1.5">
        {rotulo}
      </span>
      <textarea
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        rows={linhas}
        maxLength={maxLength}
        className={`${baseCampo} resize-y leading-relaxed`}
      />
    </label>
  );
}

export function Contador({
  rotulo,
  valor,
  bonus = 0,
  aoMudar,
  podeSubir,
}: {
  rotulo: string;
  valor: number;
  bonus?: number;
  aoMudar: (v: number) => void;
  podeSubir: boolean;
}) {
  const botao =
    "h-11 w-11 shrink-0 rounded-lg border border-line bg-surface text-xl leading-none text-bone " +
    "transition-colors hover:border-sage disabled:opacity-25 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3">
      <div className="min-w-0">
        <span className="text-sm text-bone">{rotulo}</span>
        {bonus > 0 && (
          <span className="block text-[11px] text-sage">
            já inclui o +1 da especialização
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => aoMudar(valor - 1)}
          disabled={valor <= 0}
          aria-label={`Diminuir ${rotulo}`}
          className={botao}
        >
          −
        </button>

        <span
          className={`fonte-display w-14 text-center text-2xl tabular-nums ${
            bonus > 0 ? "text-sage" : "text-bone"
          }`}
        >
          {valor + bonus}
        </span>

        <button
          type="button"
          onClick={() => aoMudar(valor + 1)}
          disabled={!podeSubir}
          aria-label={`Aumentar ${rotulo}`}
          className={botao}
        >
          +
        </button>
      </div>
    </div>
  );
}
