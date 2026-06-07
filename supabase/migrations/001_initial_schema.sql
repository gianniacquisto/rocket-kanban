-- Rocket Kanban Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Boards table
create table boards (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'My Board',
  owner_id uuid references auth.users(id) on delete cascade not null,
  icon text default '🚀',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lists table
create table lists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  board_id uuid references boards(id) on delete cascade not null,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cards table
create table cards (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  board_id uuid references boards(id) on delete cascade not null,
  list_id uuid references lists(id) on delete cascade not null,
  position integer not null default 0,
  cover_image_url text,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Labels table (board-level or global)
create table labels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text not null default '#4ECDC4',
  board_id uuid references boards(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Card-Labels junction table
create table card_labels (
  card_id uuid references cards(id) on delete cascade not null,
  label_id uuid references labels(id) on delete cascade not null,
  primary key (card_id, label_id)
);

-- RLS Policies
-- Boards
alter table boards enable row level security;

create policy "Users can view their own boards"
  on boards for select
  using (auth.uid() = owner_id);

create policy "Users can create their own boards"
  on boards for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own boards"
  on boards for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own boards"
  on boards for delete
  using (auth.uid() = owner_id);

-- Lists
alter table lists enable row level security;

create policy "Users can view lists of their boards"
  on lists for select
  using (
    exists (
      select 1 from boards where boards.id = lists.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can create lists for their boards"
  on lists for insert
  with check (
    exists (
      select 1 from boards where boards.id = lists.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can update lists of their boards"
  on lists for update
  using (
    exists (
      select 1 from boards where boards.id = lists.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can delete lists of their boards"
  on lists for delete
  using (
    exists (
      select 1 from boards where boards.id = lists.board_id and boards.owner_id = auth.uid()
    )
  );

-- Cards
alter table cards enable row level security;

create policy "Users can view cards of their boards"
  on cards for select
  using (
    exists (
      select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can create cards for their boards"
  on cards for insert
  with check (
    exists (
      select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can update cards of their boards"
  on cards for update
  using (
    exists (
      select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid()
    )
  );

create policy "Users can delete cards of their boards"
  on cards for delete
  using (
    exists (
      select 1 from boards where boards.id = cards.board_id and boards.owner_id = auth.uid()
    )
  );

-- Labels
alter table labels enable row level security;

create policy "Users can view their labels"
  on labels for select
  using (auth.uid() = owner_id);

create policy "Users can create their labels"
  on labels for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their labels"
  on labels for update
  using (auth.uid() = owner_id);

create policy "Users can delete their labels"
  on labels for delete
  using (auth.uid() = owner_id);

-- Card Labels
alter table card_labels enable row level security;

create policy "Users can manage card labels"
  on card_labels for all
  using (
    exists (
      select 1 from cards c
      join boards b on b.id = c.board_id
      where c.id = card_labels.card_id and b.owner_id = auth.uid()
    )
  );

-- Updated at triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_boards_updated_at
  before update on boards
  for each row execute procedure update_updated_at();

create trigger update_lists_updated_at
  before update on lists
  for each row execute procedure update_updated_at();

create trigger update_cards_updated_at
  before update on cards
  for each row execute procedure update_updated_at();
