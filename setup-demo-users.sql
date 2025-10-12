-- Demo Users Setup Script for Chubb Claims Assessment System
-- Run this SQL in your Supabase SQL Editor to create demo users

-- First, we need to create users in auth.users table
-- Note: You'll need to manually create these users in Supabase Auth Dashboard first
-- Then run this script to set up their profiles

-- Create demo assessor user profile
INSERT INTO public.users (id, email, full_name, role, driving_license, phone)
SELECT 
    id, 
    email, 
    'John Smith - Senior Assessor',
    'assessor'::user_role,
    'DL-14-2019-0123456',
    '+91-9876543210'
FROM auth.users 
WHERE email = 'assessor@chubb.com'
ON CONFLICT (email) DO UPDATE SET
    full_name = 'John Smith - Senior Assessor',
    role = 'assessor'::user_role,
    driving_license = 'DL-14-2019-0123456',
    phone = '+91-9876543210',
    updated_at = NOW();

-- Create demo admin user profile
INSERT INTO public.users (id, email, full_name, role, driving_license, phone)
SELECT 
    id, 
    email, 
    'Sarah Johnson - System Administrator',
    'admin'::user_role,
    'DL-14-2018-0987654',
    '+91-9876543211'
FROM auth.users 
WHERE email = 'admin@chubb.com'
ON CONFLICT (email) DO UPDATE SET
    full_name = 'Sarah Johnson - System Administrator',
    role = 'admin'::user_role,
    driving_license = 'DL-14-2018-0987654',
    phone = '+91-9876543211',
    updated_at = NOW();

-- Create demo claimant user profile
INSERT INTO public.users (id, email, full_name, role, driving_license, phone)
SELECT 
    id, 
    email, 
    'Mike Wilson - Policy Holder',
    'claimant'::user_role,
    'DL-14-2020-0567890',
    '+91-9876543212'
FROM auth.users 
WHERE email = 'claimant@example.com'
ON CONFLICT (email) DO UPDATE SET
    full_name = 'Mike Wilson - Policy Holder',
    role = 'claimant'::user_role,
    driving_license = 'DL-14-2020-0567890',
    phone = '+91-9876543212',
    updated_at = NOW();

-- Verify the users were created
SELECT 
    email, 
    full_name, 
    role, 
    created_at 
FROM public.users 
WHERE email IN ('assessor@chubb.com', 'admin@chubb.com', 'claimant@example.com')
ORDER BY role, email;
