-- Add 'tag' column to 'news' table
alter table news
add column if not exists tag text;

-- Optional: Add an index if filtering by tag becomes frequent
create index if not exists idx_news_tag on news (tag);
