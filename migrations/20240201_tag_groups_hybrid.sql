-- Clean up from previous attempts (revert both single-table and multi-table structures if they exist)
DROP TABLE IF EXISTS public.tag_group_members; -- From multi-table attempt
DROP TABLE IF EXISTS public.tag_groups;        -- We'll recreate this cleanly

-- Clean up single-table columns if they exist
ALTER TABLE public.search_keywords 
DROP COLUMN IF EXISTS is_group_header,
DROP COLUMN IF EXISTS group_parent_id,
DROP COLUMN IF EXISTS tag_group_id; -- Drop if exists to recreate clean FK

-- 1. Create tag_groups table
CREATE TABLE public.tag_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- Name should be unique
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add tag_group_id FK to search_keywords (1:N assumption)
ALTER TABLE public.search_keywords
ADD COLUMN tag_group_id UUID REFERENCES public.tag_groups(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.tag_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for all users" ON public.tag_groups FOR ALL USING (true) WITH CHECK (true);
