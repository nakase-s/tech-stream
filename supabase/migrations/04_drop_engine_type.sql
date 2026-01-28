-- Drop 'engine_type' column from 'news' table
alter table news drop column if exists engine_type;
