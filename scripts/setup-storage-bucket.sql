-- Setup Supabase Storage Bucket for Claim Images
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'claim-images',
  'claim-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload claim images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'claim-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to claim images
CREATE POLICY "Allow public read access to claim images" ON storage.objects
FOR SELECT USING (bucket_id = 'claim-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow users to delete claim images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'claim-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Update claim_images table to include storage_path column
ALTER TABLE claim_images 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 4. Add uploaded_at column if it doesn't exist
ALTER TABLE claim_images 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Create index on storage_path for better performance
CREATE INDEX IF NOT EXISTS idx_claim_images_storage_path 
ON claim_images(storage_path);

-- 6. Verify the setup
SELECT 
  'Storage bucket created' as status,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'claim-images') as bucket_count;

SELECT 
  'Policies created' as status,
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%claim-images%';

-- 7. Show current table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'claim_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;
