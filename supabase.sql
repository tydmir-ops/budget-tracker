-- Supabase > SQL Editor'e yapistirip Run deyin.
create table if not exists depo (
  anahtar text primary key,
  deger text not null,
  guncelleme timestamptz default now()
);
-- Anonim erisimi kapali tutar; sunucu tarafindaki servis anahtari RLS'i asar.
alter table depo enable row level security;
