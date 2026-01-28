-- Add 'color' column to 'search_keywords' table
alter table search_keywords
add column if not exists color text default '#3B82F6';
