-- Revert single-table modifications
ALTER TABLE public.search_keywords 
DROP COLUMN IF EXISTS is_group_header,
DROP COLUMN IF EXISTS group_parent_id;

-- Create tag_groups table (if not exists)
CREATE TABLE IF NOT EXISTS public.tag_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tag_group_members table (if not exists)
CREATE TABLE IF NOT EXISTS public.tag_group_members (
    group_id UUID NOT NULL REFERENCES public.tag_groups(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES public.search_keywords(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, keyword_id)
);

-- Enable RLS (Assuming default policy is needed, usually true for public tables in this app)
ALTER TABLE public.tag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now as per previous context)
CREATE POLICY "Enable all access for all users" ON public.tag_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.tag_group_members FOR ALL USING (true) WITH CHECK (true);
