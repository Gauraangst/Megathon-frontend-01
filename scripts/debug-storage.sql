-- Debug Storage Bucket Issues
-- Run this in Supabase SQL Editor to check storage setup

-- 1. Check if bucket exists and is public
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'claim-images';

-- 2. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 3. Check if there are any objects in the bucket
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects 
WHERE bucket_id = 'claim-images'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check claim_images table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'claim_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check recent claim images with their URLs
SELECT 
  id,
  claim_id,
  image_filename,
  image_type,
  storage_path,
  LEFT(image_url, 100) as url_preview,
  LENGTH(image_url) as url_length,
  uploaded_at
FROM claim_images 
ORDER BY uploaded_at DESC 
LIMIT 5;
