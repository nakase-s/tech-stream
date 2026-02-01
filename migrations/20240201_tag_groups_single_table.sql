-- Drop previous tables if they exist
DROP TABLE IF EXISTS public.tag_group_members;
DROP TABLE IF EXISTS public.tag_groups;

-- Alter search_keywords table to support hierarchy
ALTER TABLE public.search_keywords 
ADD COLUMN IF NOT EXISTS is_group_header BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS group_parent_id UUID REFERENCES public.search_keywords(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_search_keywords_group_parent_id ON public.search_keywords(group_parent_id);
CREATE INDEX IF NOT EXISTS idx_search_keywords_is_group_header ON public.search_keywords(is_group_header);
