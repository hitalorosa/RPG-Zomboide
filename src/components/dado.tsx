"use client";

import { useEffect, useState } from "react";

/** Cor por tipo de dado, na mesma lógica dos dados físicos. */
export const COR_DADO: Record<number, string> = {
  4: "#3f9e63",
  6: "#2ba3ad",
  8: "#8a5bc4",
  10: "#c4488f",
  12: "#c4453a",
  20: "#d1762c",
  100: "#7d8b6a",
};

/** Silhueta de cada dado, num viewBox 100x100. */
const FORMA: Record<number, string> = {
  4: "50,6 94,88 6,88",
  6: "12,12 88,12 88,88 12,88",
  8: "50,4 94,50 50,96 6,50",
  10: "50,3 92,36 68,96 32,96 8,36",
  12: "50,4 95,37 78,92 22,92 5,37",
  20: "50,3 90,26 90,74 50,97 10,74 10,26",
  100: "50,3 90,26 90,74 50,97 10,74 10,26",
};

export function Dado({
  lados,
  valor,
  rolando,
  destaque,
  tamanho = 96,
}: {
  lados: number;
  valor: number;
  rolando: boolean;
  /** o dado que valeu, quando tem vantagem */
  destaque?: boolean;
  tamanho?: number;
}) {
  const [mostrado, setMostrado] = useState(valor);

  // enquanto rola, troca o número depressa. O resultado real já foi sorteado:
  // isso aqui é só a cara da rolagem.
  useEffect(() => {
    if (!rolando) {
      setMostrado(valor);
      return;
    }
    const t = setInterval(
      () => setMostrado(Math.floor(Math.random() * lados) + 1),
      55
    );
    return () => clearInterval(t);
  }, [rolando, valor, lados]);

  const cor = COR_DADO[lados] ?? "#7d8b6a";
  const apagado = destaque === false;

  return (
    <div
      style={{ width: tamanho, height: tamanho }}
      className={`relative shrink-0 ${rolando ? "dado-rolando" : "dado-parou"} ${
        apagado ? "opacity-35" : ""
      }`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polygon
          points={FORMA[lados] ?? FORMA[20]}
          fill={cor}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* brilho na metade de cima, dá volume sem sombra pesada */}
        <polygon
          points={FORMA[lados] ?? FORMA[20]}
          fill="rgba(255,255,255,0.14)"
          clipPath="inset(0 0 55% 0)"
        />
      </svg>

      <span
        className="fonte-display absolute inset-0 flex items-center justify-center
                   text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)] tabular-nums"
        style={{ fontSize: tamanho * (mostrado > 99 ? 0.3 : 0.4) }}
      >
        {mostrado}
      </span>

      {destaque && (
        <span className="absolute -top-1 -right-1 rounded-full bg-sage px-1.5 py-0.5 text-[9px] font-bold text-ink">
          ✓
        </span>
      )}
    </div>
  );
}
