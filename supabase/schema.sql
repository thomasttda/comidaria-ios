-- Comidaria - Banco de dados Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- Habilitar extensões
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- Tabela: categories
-- ============================================
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Tabela: products
-- ============================================
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  preparation_time integer default 15, -- em minutos
  ingredients text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Tabela: users (profiles)
-- ============================================
create table if not exists users (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin', 'delivery')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Tabela: addresses
-- ============================================
create table if not exists addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade,
  label text default 'Residencial', -- Residencial, Trabalho, etc.
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  latitude numeric,
  longitude numeric,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Tabela: orders
-- ============================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete set null,
  address_id uuid references addresses(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  payment_method text,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Tabela: order_items
-- ============================================
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  observations text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- Índices
-- ============================================
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_is_available on products(is_available);
create index if not exists idx_products_is_featured on products(is_featured);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);
create index if not exists idx_addresses_user_id on addresses(user_id);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_categories_is_active on categories(is_active);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
alter table categories enable row level security;
alter table products enable row level security;
alter table users enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- ============================================
-- Políticas: categories (leitura pública)
-- ============================================
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

create policy "Categories are insertable by admins"
  on categories for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Categories are updatable by admins"
  on categories for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Categories are deletable by admins"
  on categories for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: products (leitura pública, escrita admin)
-- ============================================
create policy "Products are viewable by everyone"
  on products for select
  using (true);

create policy "Products are insertable by admins"
  on products for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Products are updatable by admins"
  on products for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Products are deletable by admins"
  on products for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- Políticas: users (próprio usuário)
-- ============================================
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id);

-- ============================================
-- Políticas: addresses (próprio usuário)
-- ============================================
create policy "Users can view own addresses"
  on addresses for select
  using (auth.uid() = user_id);

create policy "Users can insert own addresses"
  on addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own addresses"
  on addresses for update
  using (auth.uid() = user_id);

create policy "Users can delete own addresses"
  on addresses for delete
  using (auth.uid() = user_id);

-- ============================================
-- Políticas: orders (próprio usuário, admins veem tudo)
-- ============================================
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on orders for update
  using (auth.uid() = user_id);

-- ============================================
-- Políticas: order_items (vinculados a orders do usuário)
-- ============================================
create policy "Users can view own order items"
  on order_items for select
  using (exists (
    select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

create policy "Users can insert own order items"
  on order_items for insert
  with check (exists (
    select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

-- ============================================
-- Tabela: banners
-- ============================================
create table if not exists banners (
  id uuid default uuid_generate_v4() primary key,
  title text,
  subtitle text,
  image_url text not null,
  link_url text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table banners enable row level security;

create policy "Banners are viewable by everyone"
  on banners for select
  using (true);

create policy "Banners are manageable by admins"
  on banners for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- View: finance_summary
-- ============================================
create or replace view finance_summary as
select
  (select count(*) from orders where date(created_at) = current_date) as today_orders,
  (select coalesce(sum(total), 0) from orders where date(created_at) = current_date and payment_status = 'paid') as today_revenue,
  (select count(*) from orders where date_trunc('month', created_at) = date_trunc('month', current_date)) as monthly_orders,
  (select coalesce(sum(total), 0) from orders where date_trunc('month', created_at) = date_trunc('month', current_date) and payment_status = 'paid') as monthly_revenue,
  (select case when count(*) > 0 then round(avg(total)::numeric, 2) else 0 end from orders where date_trunc('month', created_at) = date_trunc('month', current_date) and payment_status = 'paid') as avg_ticket,
  (select count(*) from orders where status = 'cancelled' and date_trunc('month', created_at) = date_trunc('month', current_date)) as monthly_cancellations;

-- ============================================
-- Dados iniciais: Categorias
-- ============================================
insert into categories (name, slug, description, sort_order) values
  ('Nhoque', 'nhoque', 'Nhoque caseiro com diversos molhos', 1),
  ('Espaguete', 'espaguete', 'Espaguete com diversos molhos', 2)
on conflict (slug) do nothing;

-- ============================================
-- Dados iniciais: Produtos
-- ============================================
insert into products (category_id, name, description, price, image_url, is_available, is_featured, preparation_time, ingredients) values
  ((select id from categories where slug = 'nhoque'), 'Nhoque à Bolonhesa', 'Nhoque caseiro com molho bolonhesa', 32.90, null, true, true, 20, ARRAY['nhoque', 'molho bolonhesa']),
  ((select id from categories where slug = 'nhoque'), 'Nhoque ao Frango', 'Nhoque caseiro com molho de frango', 32.90, null, true, false, 20, ARRAY['nhoque', 'frango']),
  ((select id from categories where slug = 'nhoque'), 'Nhoque ao Lombo', 'Nhoque caseiro com molho de lombo suíno', 34.90, null, true, false, 20, ARRAY['nhoque', 'lombo']),
  ((select id from categories where slug = 'nhoque'), 'Nhoque de Frutos do Mar', 'Nhoque caseiro com molho de frutos do mar', 38.90, null, true, false, 20, ARRAY['nhoque', 'frutos do mar']),
  ((select id from categories where slug = 'espaguete'), 'Espaguete à Bolonhesa', 'Espaguete com molho bolonhesa', 32.90, null, true, true, 20, ARRAY['espaguete', 'molho bolonhesa']),
  ((select id from categories where slug = 'espaguete'), 'Espaguete ao Frango', 'Espaguete com molho de frango', 32.90, null, true, false, 20, ARRAY['espaguete', 'frango']),
  ((select id from categories where slug = 'espaguete'), 'Espaguete ao Lombo', 'Espaguete com molho de lombo suíno', 34.90, null, true, false, 20, ARRAY['espaguete', 'lombo']),
  ((select id from categories where slug = 'espaguete'), 'Espaguete de Frutos do Mar', 'Espaguete com molho de frutos do mar', 38.90, null, true, false, 20, ARRAY['espaguete', 'frutos do mar'])
on conflict do nothing;

-- ============================================
-- Função: atualizar updated_at automaticamente
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
do $$
declare
  tables text[] := array['categories', 'products', 'users', 'addresses', 'orders', 'order_items'];
  t text;
begin
  foreach t in array tables loop
    execute format('
      create trigger if not exists update_%I_updated_at
      before update on %I
      for each row
      execute function update_updated_at_column();
    ', t, t);
  end loop;
end $$;

-- ============================================
-- Fim do script
-- ============================================
