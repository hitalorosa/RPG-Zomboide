# Estado do projeto

Atualizado em 29/08/2026.

## No ar

| Rota | O que é |
|---|---|
| `/` | Entrada — "quem vai entrar na jornada?" |
| `/ficha` | Ficha do sobrevivente (edição) |
| `/personagem` | Página do personagem (só leitura) |
| `/mesa` | Painel do narrador: mapa + sobreviventes |
| `/criaturas` | As 11, com tarja |
| `/faccoes` | Conselho e Cicatrizes, com tarja |

## Banco

Migrações em `supabase/`, rodar na ordem no SQL Editor:

- `schema.sql` — jogadores ✅ rodada
- `002_personagens.sql` — personagens ✅ rodada
- `003_descricao_visual.sql` — descrição visual e retrato ✅ rodada
- `004_descobertas.sql` — o que já foi revelado ⚠️ **rodar a parte das facções**

> A 004 ganhou um bloco no fim (os cinco `faccao:*` do Conselho). Se você já
> rodou a versão antiga, rode só esse bloco final de novo — ele tem
> `on conflict do nothing`, então não quebra nada.

## Imagens

Tudo servido pelo próprio site, sem serviço externo:

- `public/mapas/` — 8 mapas (10,2 MB → 2,0 MB)
- `public/criaturas/` — 11 zumbis (43,7 MB → 0,6 MB junto com as facções)
- `public/faccoes/` — 6 rostos
- `public/retratos/` — retratos dos personagens; a URL vira `/retratos/nome.png`

## Pendente

1. **Estado da mesa é local.** O contador de doses de Freio e o mapa atual
   ficam no `localStorage` do navegador do narrador. Para valer em todos os
   aparelhos, falta uma tabela `mesa` no Supabase.
2. **Retrato é link colado.** Funciona, mas o arquivo precisa existir em
   `public/retratos/` (ou em outro lugar hospedado). Alternativa futura:
   upload direto pelo Supabase Storage.
3. **As quatro barras sem fórmula.** Medo, Pânico, Estresse e Fadiga estão
   com máximo fixo em 10 — a ficha original diz "a decidir de acordo com a
   habilidade" e essa regra ainda não foi fechada.
4. **Personagem de exemplo.** Existe uma "Dalva Prudente" ligada ao jogador
   Hitalo, criada só para testar. É só apagar quando não servir mais.
5. **A campanha em si.** Falta o Caminho 3 das regras (Sangue-Frio, Freio e
   Nível de Procurado escritos como regra), os Bosses, e os arcos de história.
   Ver `docs/`.

## Rodando

```bash
npm install
npm run dev
```

O site funciona sem banco — nesse modo tudo fica só no navegador.
