-- ============================================================
-- Migração 2 — coluna livre de CNH em motoristas
-- ============================================================
-- O schema inicial (schema.sql) modelou a CNH em 3 colunas separadas
-- (cnh_numero, cnh_categoria, cnh_validade), mas a tela de
-- cadastro/edição de motorista usa um único campo de texto livre
-- ("CNH (categoria e validade)", ex.: "CNH E 22/09/1"). Em vez de
-- reescrever a UI para 3 campos, esta migração adiciona uma coluna de
-- texto livre para casar exatamente com o que a tela já salva.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez.

alter table motoristas add column if not exists cnh text;
