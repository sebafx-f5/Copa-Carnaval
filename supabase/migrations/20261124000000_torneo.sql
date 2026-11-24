create table public.torneo (
  categoria text primary key check (categoria in ('ma', 'mb', 'f', 'p')),
  datos jsonb not null default '{}'::jsonb check (jsonb_typeof(datos) = 'object' and pg_column_size(datos) < 2000000),
  actualizado timestamptz not null default now()
);

alter table public.torneo enable row level security;

create policy "Lectura publica" on public.torneo
  for select to anon, authenticated
  using (true);

create policy "Insertar solo admin" on public.torneo
  for insert to authenticated
  with check (true);

create policy "Actualizar solo admin" on public.torneo
  for update to authenticated
  using (true)
  with check (true);

insert into public.torneo (categoria) values ('ma'), ('mb'), ('f'), ('p');
