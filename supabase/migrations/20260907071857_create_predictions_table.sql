/*
# Create predictions table for CropCare AI

## Purpose
Stores crop disease detection history for the CropCare AI application.
This is a single-tenant app with no sign-in, so all data is intentionally
shared/public and accessible via the anon key.

## New Tables
- `predictions`
  - `id` (uuid, primary key, auto-generated)
  - `crop` (text, not null) - e.g. "Tomato", "Potato"
  - `disease` (text, not null) - e.g. "Early Blight", "Healthy"
  - `confidence` (numeric, not null) - confidence percentage 0-100
  - `status` (text, not null) - "Healthy" or "Diseased"
  - `image_url` (text, nullable) - URL of the uploaded leaf image
  - `description` (text, nullable) - disease description
  - `symptoms` (jsonb, nullable) - array of symptom strings
  - `recommendation` (jsonb, nullable) - array of recommendation strings
  - `created_at` (timestamptz, default now)

## Security
- RLS enabled on `predictions`.
- All CRUD operations allowed for anon + authenticated (single-tenant, no-auth app).
- `USING (true)` / `WITH CHECK (true)` is acceptable because this is a
  single-tenant app with no sign-in — all data is intentionally public.

## Notes
1. No user_id column — this is a no-auth single-tenant app.
2. Symptoms and recommendations stored as JSONB arrays.
3. Index on created_at for efficient history ordering.
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL,
  disease text NOT NULL,
  confidence numeric NOT NULL,
  status text NOT NULL,
  image_url text,
  description text,
  symptoms jsonb,
  recommendation jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at DESC);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);
