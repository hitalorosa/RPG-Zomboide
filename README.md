# RPG Zomboide

Painel de mesa para a campanha — sobrevivência em Campinas, cinco anos depois
do colapso.

Duas telas, dois usos:

- **Jogador** (celular) — entrar, montar personagem, ver a própria ficha
- **Mesa** (computador) — mapa atual, criaturas conhecidas, facções, e o estado
  de todos os sobreviventes ao mesmo tempo

---

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

O site **funciona sem banco de dados** — nesse modo os nomes ficam salvos só no
navegador. Serve para testar a interface antes de ligar o Supabase.

---

## Ligando o Supabase

1. Criar um projeto em [supabase.com](https://supabase.com)
2. Abrir **SQL Editor → New query**, colar o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e rodar
3. Copiar `.env.local.example` para `.env.local`
4. Preencher com os valores de **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` — a URL do projeto
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — a chave `anon` / `public`
5. Reiniciar o `npm run dev`

O aviso de "banco não conectado" some quando estiver certo.

---

## Publicando na Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importar este
   repositório
2. Em **Environment Variables**, colocar as mesmas duas variáveis do
   `.env.local`
3. Deploy

A partir daí, todo `git push` na branch principal republica sozinho.

---

## Estrutura

```
src/app/page.tsx        entrada — "quem vai entrar na jornada?"
src/app/ficha/          ficha do sobrevivente
src/lib/supabase.ts     cliente do banco (tolera ausência de credenciais)
src/lib/jogadores.ts    leitura/escrita de jogadores + sessão
supabase/schema.sql     esquema do banco
```

## Stack

Next.js · TypeScript · Tailwind CSS · Supabase · deploy na Vercel
