begin;
create schema if not exists private;
revoke all on schema private from public;
create table public.admins(user_id uuid primary key references auth.users(id) on delete cascade, singleton boolean not null default true unique check(singleton));
alter table public.admins enable row level security;
revoke all on public.admins from anon,authenticated;
grant select on public.admins to authenticated;
create policy own_admin_membership on public.admins for select to authenticated using(user_id=(select auth.uid()));
create function public.is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select exists(select 1 from public.admins where user_id=(select auth.uid())); $$;
revoke all on function public.is_admin() from public,anon;
grant execute on function public.is_admin() to authenticated;
create table public.categories(id uuid primary key default gen_random_uuid(),name text not null unique check(length(name) between 1 and 100),slug text not null unique check(slug~'^[a-z0-9]+(-[a-z0-9]+)*$'),sort_order int not null default 0,created_at timestamptz not null default now());
create table public.products(
 id uuid primary key default gen_random_uuid(),category_id uuid references public.categories(id) on delete set null,
 name text not null check(length(btrim(name)) between 1 and 160),slug text not null unique check(slug~'^[a-z0-9]+(-[a-z0-9]+)*$'),description text not null default '' check(length(description)<=10000),specs jsonb not null default '{}' check(jsonb_typeof(specs)='object'),
 price numeric(12,2) not null check(price>=0),bulk_price numeric(12,2) check(bulk_price>=0),stock_qty int not null default 0 check(stock_qty>=0),low_stock_threshold int not null default 5 check(low_stock_threshold>=0),is_available boolean not null default true,is_featured boolean not null default false,images text[] not null default '{}' check(cardinality(images)<=12),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 stock_status text generated always as (case when not is_available or stock_qty=0 then 'out' when stock_qty<=low_stock_threshold then 'low' else 'in_stock' end) stored
);
create index products_category_idx on public.products(category_id);
create index products_newest_idx on public.products(created_at desc);
create index products_stock_idx on public.products(stock_status);
create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
create trigger products_updated before update on public.products for each row execute function private.touch_updated_at();
create sequence private.quote_number_seq;
create table public.quotations(id uuid primary key default gen_random_uuid(),quote_no text not null unique,customer_name text not null check(length(btrim(customer_name)) between 1 and 160),customer_phone text not null default '' check(length(customer_phone)<=40),items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 100),total numeric(12,2) not null check(total>=0),status text not null default 'valid' check(status in('valid','expired','cancelled')),valid_until date,created_at timestamptz not null default now());
-- Invoker trigger computes authoritative totals. The random suffix prevents sequential public lookups.
create function private.prepare_quote() returns trigger language plpgsql set search_path='' as $$
declare item jsonb; amount numeric:=0; quantity numeric; unit_price numeric;
begin
 if tg_op='INSERT' then new.quote_no='CE-'||extract(year from now())::text||'-'||lpad(nextval('private.quote_number_seq')::text,4,'0')||'-'||upper(replace(gen_random_uuid()::text,'-','')); else new.quote_no=old.quote_no;new.created_at=old.created_at; end if;
 for item in select value from jsonb_array_elements(new.items) loop
  quantity=(item->>'qty')::numeric;unit_price=(item->>'price')::numeric;
  if quantity is null or unit_price is null or quantity<1 or quantity>100000 or quantity<>trunc(quantity) or unit_price<0 or unit_price>9999999 or coalesce(length(btrim(item->>'name')),0) not between 1 and 160 then raise exception 'Invalid quotation item';end if;
  amount=amount+quantity*unit_price;
 end loop;
 new.total=round(amount,2);return new;
end $$;
grant usage on schema private to authenticated;
grant usage on sequence private.quote_number_seq to authenticated;
create trigger quotation_values before insert or update on public.quotations for each row execute function private.prepare_quote();
create table public.messages(id uuid primary key default gen_random_uuid(),name text not null check(length(btrim(name)) between 1 and 100),phone text not null default '' check(length(phone)<=40),email text not null default '' check(length(email)<=254),body text not null check(length(btrim(body)) between 10 and 3000),website text not null default '' check(website=''),is_read boolean not null default false,created_at timestamptz not null default now());
create table public.site_content(key text primary key check(key in('about','legacy','hero','contact')),value jsonb not null check(jsonb_typeof(value)='object' and octet_length(value::text)<=20000),updated_at timestamptz not null default now());
create trigger site_content_updated before update on public.site_content for each row execute function private.touch_updated_at();
do $$ declare tab text; begin
 foreach tab in array array['categories','products','quotations','messages','site_content'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from anon,authenticated',tab);
  execute format('grant select,insert,update,delete on public.%I to authenticated',tab);
  execute format('create policy owner_all on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',tab);
 end loop;
 foreach tab in array array['categories','products','site_content'] loop
  execute format('grant select on public.%I to anon',tab);
  execute format('create policy catalog_read on public.%I for select to anon,authenticated using (true)',tab);
 end loop;
end $$;
grant insert(name,phone,email,body,website) on public.messages to anon;
create policy message_submit on public.messages for insert to anon,authenticated with check(not is_read and website='' and created_at between now()-interval '1 minute' and now()+interval '1 minute');
-- Explicitly scoped public declassifier: no full name, phone, items or internal ID.
-- SECURITY DEFINER is required for anonymous verification without SELECT on quotations.
create function public.verify_quotation(p_quote_no text)
returns table(quote_no text,customer_first_name text,total numeric,status text,valid_until date,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select q.quote_no,split_part(btrim(q.customer_name),' ',1),q.total,
 case when q.status='valid' and q.valid_until<current_date then 'expired' else q.status end,q.valid_until,q.created_at
 from public.quotations q where length(p_quote_no)<=100 and q.quote_no=upper(btrim(p_quote_no)) limit 1;
$$;
revoke all on function public.verify_quotation(text) from public;
grant execute on function public.verify_quotation(text) to anon,authenticated;
revoke all on function private.touch_updated_at(),private.prepare_quote() from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy product_images_owner on storage.objects for all to authenticated using(bucket_id='product-images' and (select public.is_admin())) with check(bucket_id='product-images' and (select public.is_admin()));
do $$ begin if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='products') then alter publication supabase_realtime add table public.products;end if;end $$;
insert into public.categories(name,slug,sort_order) values('Arduino Boards','arduino-boards',0),('Sensors','sensors',1),('Modules','modules',2),('Resistors & Capacitors','resistors-capacitors',3),('Wires & Breadboards','wires-breadboards',4),('Tools','tools',5);
insert into public.site_content(key,value) values('about','{"title":"Made for curious minds","body":"Ceylon Electronics supplies Arduino accessories and electronic components to students, makers and bulk buyers in the Eastern Province. Visit us in Kattankudy for support choosing components for your next project."}'),('legacy','{"title":"Helping the next generation build","body":"Our purpose is simple: make electronics more accessible to students and makers in our community. From first circuits to ambitious prototypes, we are here to help you keep building."}'),('hero','{"title":"Small components.\nBig possibilities.","subtitle":"The leading supplier for School Students & Bulk Orders in the Eastern Province."}'),('contact','{"phone":"077 861 1358","address":"536, New Kalmunai Road, Kattankudi, Batticaloa 30100, Sri Lanka","hours":"Open daily · Closes 9 PM"}');
commit;
