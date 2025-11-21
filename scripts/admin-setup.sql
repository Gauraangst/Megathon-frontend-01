-- Admin User Setup for Chubb Claims Assessment System
-- Run this SQL in your Supabase SQL Editor AFTER creating the admin user in Supabase Auth

-- First, you need to create the admin user in Supabase Auth Dashboard:
-- Email: admin@chubb.com
-- Password: Admin@123
-- Then run this SQL to set the user role to admin

-- Update the user role to admin (replace the email with the actual admin email)
UPDATE public.users 
SET 
    role = 'admin',
    full_name = 'System Administrator',
    updated_at = NOW()
WHERE email = 'admin@chubb.com';

-- If the user doesn't exist in public.users table, insert them
-- (This handles the case where the trigger didn't fire)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    id, 
    email, 
    'System Administrator',
    'admin'::user_role
FROM auth.users 
WHERE email = 'admin@chubb.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@chubb.com'
);

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE role = 'admin';
