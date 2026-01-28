-- Enable Row Level Security (RLS) on the table if not already enabled
ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;

-- DROP existing policy if it conflicts (optional, safe to run if policy doesn't exist usually, but explicit drop is cleaner)
-- DROP POLICY IF EXISTS "Enable update for all users" ON "public"."news";

-- Create a permissive policy that allows Update for public (anon) and authenticated users
-- This is appropriate for a personal dashboard/single-user app context
CREATE POLICY "Enable update for all users" 
ON "public"."news" 
AS PERMISSIVE 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- Verify the change
-- SELECT * FROM pg_policies WHERE tablename = 'news';
