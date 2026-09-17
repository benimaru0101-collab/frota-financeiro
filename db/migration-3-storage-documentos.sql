-- ============================================================
-- Migração 3 — Storage bucket para upload de documentos
-- ============================================================
-- Cria o bucket público "documentos" no Supabase Storage e as
-- políticas necessárias para o app enviar (upload) e exibir
-- (leitura) os arquivos anexados a cada documento (seguro, IPVA,
-- licenciamento...). A coluna `arquivo_url` já existe desde o
-- schema.sql — esta migração só cuida do Storage.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez. É seguro rodar mais
-- de uma vez (idempotente).

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

drop policy if exists "Documentos - leitura publica" on storage.objects;
create policy "Documentos - leitura publica"
on storage.objects for select
using (bucket_id = 'documentos');

drop policy if exists "Documentos - upload autenticado" on storage.objects;
create policy "Documentos - upload autenticado"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documentos');

drop policy if exists "Documentos - update autenticado" on storage.objects;
create policy "Documentos - update autenticado"
on storage.objects for update
to authenticated
using (bucket_id = 'documentos');

drop policy if exists "Documentos - delete autenticado" on storage.objects;
create policy "Documentos - delete autenticado"
on storage.objects for delete
to authenticated
using (bucket_id = 'documentos');
