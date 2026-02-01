-- Create tag_groups table
CREATE TABLE IF NOT EXISTS public.tag_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tag_group_members table
CREATE TABLE IF NOT EXISTS public.tag_group_members (
    group_id UUID NOT NULL REFERENCES public.tag_groups(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES public.search_keywords(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, keyword_id)
);

-- Enable RLS (Optional, depending on your setup)
ALTER TABLE public.tag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust as needed for your auth setup, assuming public/service role for now or authenticated users)
CREATE POLICY "Enable read access for all users" ON public.tag_groups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.tag_groups FOR INSERT WITH CHECK (true); -- Adjust to auth.role() = 'authenticated' if needed
CREATE POLICY "Enable update for authenticated users only" ON public.tag_groups FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.tag_groups FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.tag_group_members FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.tag_group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.tag_group_members FOR DELETE USING (true);
