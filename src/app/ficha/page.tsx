"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { encerrarSessao, lerSessao, type Jogador } from "@/lib/jogadores";
import {
  carregarPersonagem,
  personagemVazio,
  salvarPersonagem,
  type Personagem,
} from "@/lib/personagens";
import {
  acharEspecializacao,
  ATRIBUTOS,
  CONDICOES,
  ESPECIALIZACOES,
  ESTADOS,
  FORMULA_TEXTO,
  PONTOS_INICIAIS,
  calcularMaximos,
  type ChaveAtributo,
} from "@/lib/regras";
import { Area, Campo, Contador, Secao } from "@/components/campos";
import { supabaseConfigurado } from "@/lib/supabase";

export default function PaginaFicha() {
  const router = useRouter();
  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [p, setP] = useState<Personagem | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sujo, setSujo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  /* ------------------------------ carga ------------------------------ */

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

  /* ---------------------------- derivados ---------------------------- */

  const espec = acharEspecializacao(p?.especializacao);

  const gastos = useMemo(
    () =>
      p ? ATRIBUTOS.reduce((s, a) => s + (p[a.chave] as number), 0) : 0,
    [p]
  );
  const restantes = PONTOS_INICIAIS - gastos;

  const maximos = useMemo(() => {
    if (!p) return null;
    const base = Object.fromEntries(
      ATRIBUTOS.map((a) => [
        a.chave,
        (p[a.chave] as number) + (p.atributo_bonus === a.chave ? 1 : 0),
      ])
    ) as Record<ChaveAtributo, number>;
    return calcularMaximos(base);
  }, [p]);

  function mudar<K extends keyof Personagem>(campo: K, valor: Personagem[K]) {
    setP((atual) => (atual ? { ...atual, [campo]: valor } : atual));
    setSujo(true);
    setAviso(null);
  }

  /* ------------------------------ salvar ----------------------------- */

  async function salvar() {
    if (!p || !maximos) return;
    setErro(null);
    setSalvando(true);
    try {
      // aplica os máximos calculados e enche as barras que ainda estão zeradas
      const pronto: Personagem = {
        ...p,
        ...maximos,
        vida: p.vida || maximos.vida_max,
        sanidade: p.sanidade || maximos.sanidade_max,
        medo: p.medo || 0,
        panico: p.panico || 0,
        estresse: p.estresse || 0,
        fadiga: p.fadiga || 0,
      };
      const salvo = await salvarPersonagem(pronto);
      setP(salvo);
      setSujo(false);
      setAviso("Ficha salva.");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando || !p || !jogador || !maximos) return null;

  /* ------------------------------- view ------------------------------ */

  return (
    <main className="flex-1 px-5 pt-10 pb-32">
      <div className="mx-auto w-full max-w-2xl">
        {/* cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="fonte-display text-xs tracking-[0.3em] text-rust">
              {jogador.nome.toUpperCase()}
            </p>
            <h1 className="fonte-display uppercase text-bone text-3xl sm:text-4xl leading-none mt-1">
              Preencha a ficha
            </h1>
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

        <div className="mt-4 h-px w-full bg-line" />

        {/* ---------------------------- identidade --------------------- */}
        <Secao titulo="Identidade">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Nome"
              valor={p.nome}
              aoMudar={(v) => mudar("nome", v)}
              placeholder="Nome do personagem"
            />
            <Campo
              rotulo="Idade"
              valor={p.idade}
              aoMudar={(v) => mudar("idade", v)}
              maxLength={12}
            />
            <Campo
              rotulo="Pronomes"
              valor={p.pronomes}
              aoMudar={(v) => mudar("pronomes", v)}
              maxLength={24}
            />
            <Campo
              rotulo="Profissão antes do surto"
              valor={p.profissao_antes}
              aoMudar={(v) => mudar("profissao_antes", v)}
            />
          </div>
        </Secao>

        {/* -------------------------- especialização -------------------- */}
        <Secao titulo="Especialização">
          <ul className="grid gap-3 sm:grid-cols-2">
            {ESPECIALIZACOES.map((e) => {
              const escolhida = p.especializacao === e.chave;
              return (
                <li key={e.chave}>
                  <button
                    type="button"
                    onClick={() => {
                      mudar("especializacao", e.chave);
                      setP((a) =>
                        a ? { ...a, atributo_bonus: null } : a
                      );
                    }}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                      escolhida
                        ? "border-sage bg-surface-2"
                        : "border-line bg-surface hover:border-sage/50"
                    }`}
                  >
                    <span
                      className={`fonte-display uppercase block ${
                        escolhida ? "text-sage" : "text-bone"
                      }`}
                    >
                      {e.nome}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-bone-dim">
                      {e.descricao}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {espec && (
            <div className="mt-5 rounded-xl border border-line bg-surface/40 p-4">
              <p className="text-xs uppercase tracking-wider text-bone-dim">
                O +1 da especialização vai em
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {espec.bonus.map((chave) => {
                  const nome = ATRIBUTOS.find((a) => a.chave === chave)!.nome;
                  const ativo = p.atributo_bonus === chave;
                  return (
                    <button
                      key={chave}
                      type="button"
                      onClick={() => mudar("atributo_bonus", chave)}
                      className={`fonte-display uppercase rounded-lg border px-4 py-2 text-sm transition-colors ${
                        ativo
                          ? "border-sage bg-surface-2 text-sage"
                          : "border-line text-bone hover:border-sage/50"
                      }`}
                    >
                      {nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Secao>

        {/* ---------------------------- atributos ----------------------- */}
        <Secao titulo="Atributos">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-bone-dim">
              Pontos restantes
            </span>
            <span
              className={`fonte-display text-2xl tabular-nums ${
                restantes === 0
                  ? "text-sage"
                  : restantes < 0
                    ? "text-perigo"
                    : "text-ochre"
              }`}
            >
              {restantes}
            </span>
          </div>

          <div className="grid gap-2">
            {ATRIBUTOS.map((a) => (
              <Contador
                key={a.chave}
                rotulo={a.nome}
                valor={p[a.chave] as number}
                bonus={p.atributo_bonus === a.chave ? 1 : 0}
                podeSubir={restantes > 0}
                aoMudar={(v) => mudar(a.chave, Math.max(0, v))}
              />
            ))}
          </div>
        </Secao>

        {/* ------------------------------ estado ------------------------ */}
        <Secao
          titulo="Estado"
          aviso="Vida e Sanidade saem dos atributos. As outras quatro ainda estão sem fórmula — dá para editar o máximo à mão."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {ESTADOS.map((e) => {
              const chaveMax = `${e.chave}_max` as keyof Personagem;
              const max = maximos[chaveMax as keyof typeof maximos] as number;
              return (
                <div
                  key={e.chave}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface/40 px-4 py-3"
                >
                  <div>
                    <span className="text-sm text-bone">{e.nome}</span>
                    <span className="block text-[11px] text-bone-dim/70">
                      {FORMULA_TEXTO[e.chave]}
                    </span>
                  </div>
                  <span className="fonte-display text-2xl tabular-nums text-bone">
                    {max}
                  </span>
                </div>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="block text-xs uppercase tracking-wider text-bone-dim mb-1.5">
              Condição
            </span>
            <select
              value={p.condicao}
              onChange={(e) => mudar("condicao", e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone outline-none focus:border-sage"
            >
              {CONDICOES.map((c) => (
                <option key={c} value={c} className="bg-surface">
                  {c}
                </option>
              ))}
            </select>
          </label>
        </Secao>

        {/* ---------------------------- inventário ---------------------- */}
        <Secao titulo="Inventário">
          <Campo
            rotulo="Arma"
            valor={p.arma}
            aoMudar={(v) => mudar("arma", v)}
            placeholder="Facão, pé de cabra, revólver…"
          />

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={p.arma_barulhenta}
              onChange={(e) => mudar("arma_barulhenta", e.target.checked)}
              className="h-5 w-5 accent-[var(--color-rust)]"
            />
            <span className="text-sm text-bone">
              Barulhenta
              <span className="block text-xs text-bone-dim">
                Barulho convoca. Marque se o uso faz som.
              </span>
            </span>
          </label>

          <div className="mt-3">
            <Area
              rotulo="Itens"
              valor={p.itens}
              aoMudar={(v) => mudar("itens", v)}
              placeholder="Um item por linha"
              linhas={5}
            />
          </div>
        </Secao>

        {/* ------------------------------ perfil ------------------------ */}
        <Secao titulo="Perfil">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Qualidade"
              valor={p.qualidade}
              aoMudar={(v) => mudar("qualidade", v)}
            />
            <Campo
              rotulo="Defeito"
              valor={p.defeito}
              aoMudar={(v) => mudar("defeito", v)}
            />
            <Campo
              rotulo="Maior medo"
              valor={p.maior_medo}
              aoMudar={(v) => mudar("maior_medo", v)}
            />
            <Campo
              rotulo="Como você se acalma"
              valor={p.como_se_acalma}
              aoMudar={(v) => mudar("como_se_acalma", v)}
              placeholder="O que esse personagem faz pra recuperar a cabeça"
            />
          </div>
        </Secao>

        {/* ---------------------------- aparência ----------------------- */}
        <Secao
          titulo="Aparência"
          aviso="Descreva como o personagem é de olhar. O narrador usa esse texto para gerar o retrato dele."
        >
          <Area
            rotulo="Descrição visual"
            valor={p.descricao_visual}
            aoMudar={(v) => mudar("descricao_visual", v)}
            placeholder={
              "Idade aparente, tipo físico, tom de pele\n" +
              "Cabelo: cor, comprimento, como usa\n" +
              "Rosto: barba, olhos, expressão de sempre\n" +
              "Roupa que não tira nunca\n" +
              "Cicatriz, tatuagem, algo que marca"
            }
            linhas={8}
          />

          {p.retrato_url ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-bone-dim mb-2">
                Retrato
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.retrato_url}
                alt="Retrato do personagem"
                className="w-44 rounded-xl border border-line"
              />
            </div>
          ) : (
            <p className="mt-3 text-xs text-bone-dim/70">
              O retrato aparece aqui depois que o narrador gerar.
            </p>
          )}
        </Secao>

        {/* ----------------------------- história ----------------------- */}
        <Secao titulo="História">
          <Area
            rotulo="Conte um pouco do seu personagem"
            valor={p.historia}
            aoMudar={(v) => mudar("historia", v)}
            linhas={7}
          />
        </Secao>

        {!supabaseConfigurado && (
          <p className="mt-8 text-center text-xs text-bone-dim/70">
            Banco não conectado — a ficha está salva só neste navegador.
          </p>
        )}
      </div>

      {/* --------------------------- barra fixa ------------------------- */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-ink/95 backdrop-blur px-5 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-4">
          <span className="flex-1 text-xs text-bone-dim" aria-live="polite">
            {erro ? (
              <span className="text-perigo">{erro}</span>
            ) : aviso ? (
              <span className="text-sage">{aviso}</span>
            ) : restantes !== 0 ? (
              `${restantes > 0 ? restantes + " ponto(s) por distribuir" : "Pontos demais"}`
            ) : sujo ? (
              "Alterações não salvas"
            ) : (
              "Tudo salvo"
            )}
          </span>

          <button
            onClick={salvar}
            disabled={salvando || !sujo}
            className="fonte-display uppercase tracking-wide rounded-xl bg-rust px-8 py-3 text-bone
                       transition-opacity hover:opacity-90
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </main>
  );
}
