-- Add 'channel_title' column to 'news' table
alter table news
add column if not exists channel_title text;
