import type { Aparencia } from "@/lib/aparencia";

/** Escurece uma cor hex por um fator — usado para sombras e contornos. */
function escurecer(hex: string, fator = 0.65) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 255) * fator);
  const g = Math.round(((n >> 8) & 255) * fator);
  const b = Math.round((n & 255) * fator);
  return `rgb(${r},${g},${b})`;
}

export function Avatar({
  a,
  className = "",
}: {
  a: Aparencia;
  className?: string;
}) {
  const pele = a.pele;
  const peleSombra = escurecer(pele, 0.82);
  const traco = escurecer(pele, 0.42);
  const pelos = a.corPelos;
  const pelosSombra = escurecer(pelos, 0.7);
  const roupa = a.corRoupa;
  const roupaSombra = escurecer(roupa, 0.72);
  const roupaTraco = escurecer(roupa, 0.5);

  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label="Retrato do personagem"
    >
      {/* ---------------------------- fundo ---------------------------- */}
      <circle cx="100" cy="104" r="86" fill="rgba(127,141,107,0.10)" />

      {/* ---------------------------- torso ---------------------------- */}
      <g>
        <path
          d="M100 158c-30 0-54 14-62 32-4 9-6 19-6 30h136c0-11-2-21-6-30-8-18-32-32-62-32z"
          fill={roupa}
        />
        {a.roupa === "camisa" && (
          <>
            <path d="M86 162l14 16 14-16-6-5h-16z" fill={roupaSombra} />
            <path d="M99 178v42" stroke={roupaTraco} strokeWidth="2" />
          </>
        )}
        {a.roupa === "jaqueta" && (
          <>
            <path d="M84 161l16 20-22 39-14-1z" fill={roupaSombra} />
            <path d="M116 161l-16 20 22 39 14-1z" fill={roupaSombra} />
            <path d="M100 181v39" stroke={roupaTraco} strokeWidth="3" />
          </>
        )}
        {a.roupa === "moletom" && (
          <>
            <path
              d="M70 166c8-12 20-16 30-16s22 4 30 16c-8 10-18 14-30 14s-22-4-30-14z"
              fill={roupaSombra}
            />
            <path d="M92 180l-4 40M108 180l4 40" stroke={roupaTraco} strokeWidth="3" />
          </>
        )}
        {a.roupa === "colete" && (
          <>
            <path
              d="M78 163l22 24 22-24 12 6-10 51H76l-10-51z"
              fill={roupaSombra}
            />
            <path d="M100 187v33" stroke={roupaTraco} strokeWidth="2" />
          </>
        )}
        {a.roupa === "macacao" && (
          <>
            <path d="M80 164l8 56M120 164l-8 56" stroke={roupaSombra} strokeWidth="9" />
            <rect x="88" y="192" width="24" height="14" rx="3" fill={roupaSombra} />
          </>
        )}
      </g>

      {/* --------------------------- pescoço --------------------------- */}
      <path d="M87 130h26v28c0 6-26 6-26 0z" fill={peleSombra} />

      {/* --------------------------- tatuagem: pescoço ------------------ */}
      {a.tatuagem === "pescoco" && (
        <g opacity="0.55" stroke={traco} strokeWidth="2" fill="none">
          <path d="M91 144h18M94 151h12" />
        </g>
      )}
      {a.tatuagem === "ombro" && (
        <g opacity="0.45" stroke={escurecer(roupa, 0.4)} strokeWidth="2" fill="none">
          <path d="M52 196c8-6 16-6 24 0M56 206c8-6 16-6 24 0" />
        </g>
      )}

      {/* --------------------------- orelhas --------------------------- */}
      <ellipse cx="59" cy="104" rx="7" ry="11" fill={peleSombra} />
      <ellipse cx="141" cy="104" rx="7" ry="11" fill={peleSombra} />

      {/* ---------------------------- cabeça --------------------------- */}
      <ellipse cx="100" cy="99" rx="41" ry="49" fill={pele} />
      {/* sombra lateral, dá volume sem sombreamento pesado */}
      <path
        d="M100 50c22 0 41 22 41 49s-19 49-41 49c14-10 20-28 20-49s-6-39-20-49z"
        fill={peleSombra}
        opacity="0.5"
      />

      {/* ---------------------------- marcas ---------------------------- */}
      {a.marca === "queimadura" && (
        <g opacity="0.5" fill={escurecer(pele, 0.6)}>
          <ellipse cx="122" cy="112" rx="13" ry="17" />
          <ellipse cx="128" cy="98" rx="6" ry="7" />
        </g>
      )}
      {a.marca === "mordida" && (
        <g fill={escurecer(pele, 0.45)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={92 + i * 6} cy={148 + (i % 2) * 4} r="2.2" />
          ))}
        </g>
      )}

      {/* -------------------------- sobrancelhas ------------------------ */}
      <g fill={pelosSombra}>
        {a.rosto === "duro" ? (
          <>
            <path d="M74 86l20 5-1 5-20-5z" />
            <path d="M126 86l-20 5 1 5 20-5z" />
          </>
        ) : a.rosto === "cansado" ? (
          <>
            <path d="M74 90l20-2v4l-20 2z" opacity="0.8" />
            <path d="M126 90l-20-2v4l20 2z" opacity="0.8" />
          </>
        ) : a.rosto === "atento" ? (
          <>
            <path d="M74 84l20-3v4l-20 3z" />
            <path d="M126 84l-20-3v4l20 3z" />
          </>
        ) : (
          <>
            <rect x="75" y="85" width="19" height="4" rx="2" />
            <rect x="106" y="85" width="19" height="4" rx="2" />
          </>
        )}
      </g>

      {/* ----------------------------- olhos ---------------------------- */}
      <g>
        {a.rosto === "cansado" ? (
          <>
            <path d="M77 100q8-5 16 0" stroke={traco} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M107 100q8-5 16 0" stroke={traco} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M79 106q7 3 13 0M108 106q7 3 13 0" stroke={traco} strokeWidth="1.5" fill="none" opacity="0.5" />
          </>
        ) : (
          <>
            <ellipse cx="85" cy="101" rx="8" ry={a.rosto === "atento" ? 7 : 5.5} fill="#f4efe4" />
            <ellipse cx="115" cy="101" rx="8" ry={a.rosto === "atento" ? 7 : 5.5} fill="#f4efe4" />
            <circle cx="85" cy="101" r="3.4" fill="#1d1712" />
            <circle cx="115" cy="101" r="3.4" fill="#1d1712" />
          </>
        )}
      </g>

      {/* ----------------------------- nariz ---------------------------- */}
      <path
        d="M100 105v10l-5 3"
        stroke={traco}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* ----------------------------- boca ----------------------------- */}
      {a.rosto === "jovem" ? (
        <path d="M91 128q9 6 18 0" stroke={traco} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : a.rosto === "duro" ? (
        <path d="M89 129h22" stroke={traco} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M91 129q9 3 18 0" stroke={traco} strokeWidth="3" fill="none" strokeLinecap="round" />
      )}

      {/* ----------------------------- barba ---------------------------- */}
      {a.barba === "porFazer" && (
        <path
          d="M62 108c2 24 18 40 38 40s36-16 38-40c0 34-14 47-38 47s-38-13-38-47z"
          fill={pelos}
          opacity="0.28"
        />
      )}
      {a.barba === "cheia" && (
        <path
          d="M61 104c1 28 17 46 39 46s38-18 39-46c2 40-13 55-39 55s-41-15-39-55z"
          fill={pelos}
        />
      )}
      {a.barba === "cavanhaque" && (
        <path d="M89 132q11 5 22 0c1 12-4 18-11 18s-12-6-11-18z" fill={pelos} />
      )}
      {(a.barba === "bigode" || a.barba === "cheia") && (
        <path d="M86 122q14-7 28 0-6 5-14 5t-14-5z" fill={pelos} />
      )}

      {/* ----------------------- marcas sobre o rosto -------------------- */}
      {a.marca === "olho" && (
        <path d="M115 82l6 34" stroke={escurecer(pele, 0.5)} strokeWidth="3" strokeLinecap="round" />
      )}
      {a.marca === "bochecha" && (
        <g stroke={escurecer(pele, 0.5)} strokeWidth="2.5" strokeLinecap="round">
          <path d="M120 112l10 12M130 112l-10 12" />
        </g>
      )}
      {a.marca === "queixo" && (
        <path d="M92 140l14 6" stroke={escurecer(pele, 0.5)} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* --------------------------- tatuagem rosto ---------------------- */}
      {a.tatuagem === "rosto" && (
        <g opacity="0.6" stroke={traco} strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M70 96l-6 10M70 106l-6 10M70 116l-6 10" />
        </g>
      )}

      {/* ----------------------------- cabelo ---------------------------- */}
      <g fill={pelos}>
        {a.cabelo === "raspado" && (
          <path d="M100 50c23 0 41 20 41 44 0-14-18-24-41-24s-41 10-41 24c0-24 18-44 41-44z" opacity="0.85" />
        )}
        {a.cabelo === "curto" && (
          <path d="M100 48c24 0 42 20 42 46-4-16-10-24-16-26-8 4-38 6-52 0-6 4-12 12-16 26 0-26 18-46 42-46z" />
        )}
        {a.cabelo === "medio" && (
          <path d="M100 46c26 0 44 21 44 48 0 8-2 18-5 26l-5-2c3-14 1-26-4-32-10 6-50 6-60 0-5 6-7 18-4 32l-5 2c-3-8-5-18-5-26 0-27 18-48 44-48z" />
        )}
        {a.cabelo === "longo" && (
          <path d="M100 46c27 0 45 21 45 49 0 22-3 44-6 62l-14-4c5-22 6-40 4-54-12 8-46 8-58 0-2 14-1 32 4 54l-14 4c-3-18-6-40-6-62 0-28 18-49 45-49z" />
        )}
        {a.cabelo === "coque" && (
          <>
            <circle cx="100" cy="42" r="15" />
            <path d="M100 48c24 0 42 20 42 46-4-16-10-24-16-26-8 4-38 6-52 0-6 4-12 12-16 26 0-26 18-46 42-46z" />
          </>
        )}
        {a.cabelo === "rabo" && (
          <>
            <path d="M138 66c14 4 20 22 16 44-3 16-9 24-16 26 6-16 6-40-4-56z" />
            <path d="M100 48c24 0 42 20 42 46-4-16-10-24-16-26-8 4-38 6-52 0-6 4-12 12-16 26 0-26 18-46 42-46z" />
          </>
        )}
        {a.cabelo === "moicano" && (
          <path d="M88 60c4-16 8-24 12-24s8 8 12 24c3 10 4 18 4 26-6-6-26-6-32 0 0-8 1-16 4-26z" />
        )}
      </g>

      {/* ----------------------------- chapéu ---------------------------- */}
      {a.chapeu === "bone" && (
        <g>
          <path d="M100 44c22 0 38 15 38 32H62c0-17 16-32 38-32z" fill={roupaSombra} />
          <path d="M62 74h56c-4 10-18 16-34 16-12 0-20-6-22-16z" fill={roupaTraco} />
        </g>
      )}
      {a.chapeu === "boneTras" && (
        <g>
          <path d="M100 44c22 0 38 15 38 32H62c0-17 16-32 38-32z" fill={roupaSombra} />
          <path d="M138 74h-24c8 10 26 16 40 14-6-4-12-8-16-14z" fill={roupaTraco} />
        </g>
      )}
      {a.chapeu === "bandana" && (
        <g>
          <path d="M60 78c10-8 26-12 40-12s30 4 40 12l-3 10c-12-8-24-11-37-11s-25 3-37 11z" fill={roupaSombra} />
          <path d="M142 80l16 8-4 12-14-12z" fill={roupaTraco} />
        </g>
      )}
      {a.chapeu === "capuz" && (
        <path
          d="M100 38c30 0 50 26 50 58 0 14-3 26-7 34l-12-4c4-10 6-20 6-30 0-24-16-42-37-42S63 72 63 96c0 10 2 20 6 30l-12 4c-4-8-7-20-7-34 0-32 20-58 50-58z"
          fill={roupaSombra}
        />
      )}
      {a.chapeu === "palha" && (
        <g>
          <ellipse cx="100" cy="72" rx="62" ry="12" fill="#b99456" />
          <path d="M100 40c17 0 28 14 28 30H72c0-16 11-30 28-30z" fill="#cba966" />
          <path d="M72 66h56v6H72z" fill="#8a6a3a" />
        </g>
      )}
    </svg>
  );
}
