-- Lock write access: anon key is read-only
-- service_role bypasses RLS entirely, so Vercel API functions
-- can always write without needing explicit INSERT/UPDATE policies.
-- Dropping the permissive write policies closes the hole where
-- someone with the anon key could write directly to Supabase.

-- ── fighters ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow service role inserts" ON fighters;
DROP POLICY IF EXISTS "Allow service role updates" ON fighters;

-- Ensure RLS is on (idempotent)
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;

-- ── fights ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow service role inserts" ON fights;
DROP POLICY IF EXISTS "Allow service role updates" ON fights;

ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

-- SELECT policies remain intact (public reads are fine).
-- No INSERT/UPDATE/DELETE policies = anon role cannot write.
-- service_role ignores RLS and can always write.
