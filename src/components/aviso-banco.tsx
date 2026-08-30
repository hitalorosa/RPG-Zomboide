import { supabaseConfigurado } from "@/lib/supabase";

/**
 * Sem as variáveis do Supabase o site funciona, mas cada pessoa fica com os
 * dados presos no próprio navegador, e a mesa não vê nada. Isso já aconteceu
 * uma vez em silêncio, então agora avisa alto e em todas as páginas.
 */
export function AvisoBanco() {
  if (supabaseConfigurado) return null;

  return (
    <div className="sticky top-0 z-50 bg-perigo px-4 py-2.5 text-center">
      <p className="text-sm font-semibold text-bone">
        Banco de dados não conectado
      </p>
      <p className="mt-0.5 text-xs leading-snug text-bone/85">
        O que você preencher fica só neste aparelho e ninguém mais vai ver.
        Avise o narrador antes de continuar.
      </p>
    </div>
  );
}
