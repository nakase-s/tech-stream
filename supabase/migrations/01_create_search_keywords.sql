-- Create the search_keywords table
create table if not exists search_keywords (
  id uuid default gen_random_uuid() primary key,
  keyword text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table search_keywords enable row level security;

-- Create policy to allow all actions for service role (and anon for now if public read is desired)
-- Since this is an admin tool, we'll generally rely on the service role key in the backend
-- but adding a read policy for anon might be useful for the frontend fetching if not using server actions exclusively with service role.
-- For simplicity and consistency with the previous implementation plan using Service Role Key:

-- Allow read access to everyone (optional, if you want public to see keywords)
create policy "Enable read access for all users" on search_keywords for select using (true);

-- Allow insert/delete only for authenticated users or service role (adjust as needed based on auth setup)
-- If strictly using service_role key in server actions, these policies are bypassed.
