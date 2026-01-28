-- Migration: Multi-User Support & RLS
-- Description: Adds user_id to settings tables and creates user_news_actions for per-user news state.

-- 1. Add user_id to youtube_channels
ALTER TABLE "public"."youtube_channels"
ADD COLUMN "user_id" UUID REFERENCES auth.users(id);

-- Note: Existing rows will have NULL user_id. You may need to manually assign them or truncate the table.
-- For a clean slate: TRUNCATE TABLE "public"."youtube_channels";

-- 2. Add user_id to search_keywords
ALTER TABLE "public"."search_keywords"
ADD COLUMN "user_id" UUID REFERENCES auth.users(id);

-- 3. Create user_news_actions table
CREATE TABLE "public"."user_news_actions" (
  "user_id" UUID NOT NULL REFERENCES auth.users(id),
  "news_id" UUID NOT NULL REFERENCES "public"."news"(id) ON DELETE CASCADE,
  "action" TEXT NOT NULL CHECK (action IN ('deleted', 'bookmarked', 'read')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("user_id", "news_id", "action")
);

-- 4. Enable RLS
ALTER TABLE "public"."youtube_channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_keywords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_news_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- youtube_channels property: Users can only see/edit their own channels
CREATE POLICY "Users can manage own channels" ON "public"."youtube_channels"
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- search_keywords property: Users can only see/edit their own keywords
CREATE POLICY "Users can manage own keywords" ON "public"."search_keywords"
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- user_news_actions property: Users can only manage their own actions
CREATE POLICY "Users can manage own news actions" ON "public"."user_news_actions"
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- news property: Everyone can READ news (Shared data)
-- But for "Delete" and "Update", we don't want users touching the raw news table directly 
-- (unless it's an admin, but we don't have roles yet).
-- Users "delete" by inserting into user_news_actions.
-- So for now, we only allow SELECT on news for authenticated users.
-- The crawler (service role) will bypass RLS, so it can still INSERT.
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."news";

CREATE POLICY "Authenticated users can select news" ON "public"."news"
FOR SELECT
TO authenticated
USING (true);

-- (Optional) If you still want the "Purge" to actually delete from DB, 
-- you'd need a policy, but in this new architecture "Purge" should probably just hide it.
-- However, if "Purge" means "Delete older than X days" (Maintenance), that's a system task.
-- If "Purge" means "I don't want to see this", that's `user_news_actions`.

