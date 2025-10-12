-- ================================
-- ADMIN AUTO-ROLE ASSIGNMENT SETUP
-- ================================
-- Run this SQL in your Supabase SQL Editor to enable automatic admin role assignment

-- Function to automatically set admin role for specific emails
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-assign admin role for @chubb.com emails
    IF NEW.email LIKE '%@chubb.com' THEN
        NEW.role := 'admin';
        RAISE NOTICE 'Auto-assigned admin role to user: %', NEW.email;
    -- Auto-assign assessor role for @assessor.com emails  
    ELSIF NEW.email LIKE '%@assessor.com' THEN
        NEW.role := 'assessor';
        RAISE NOTICE 'Auto-assigned assessor role to user: %', NEW.email;
    -- Default role is claimant (already set by DEFAULT in table)
    ELSE
        RAISE NOTICE 'Assigned default claimant role to user: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign roles BEFORE user insertion
DROP TRIGGER IF EXISTS auto_assign_admin_role_trigger ON public.users;
CREATE TRIGGER auto_assign_admin_role_trigger
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_admin_role();

-- Function to handle new auth users and assign roles
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role := 'claimant'; -- default
BEGIN
    -- Determine role based on email
    IF NEW.email LIKE '%@chubb.com' THEN
        user_role := 'admin';
    ELSIF NEW.email LIKE '%@assessor.com' THEN
        user_role := 'assessor';
    ELSE
        user_role := 'claimant';
    END IF;

    -- Insert into public.users with determined role
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        user_role
    );
    
    RAISE NOTICE 'Created user % with role %', NEW.email, user_role;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the auth trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_with_role();

-- Verify the setup
SELECT 
    'Setup completed successfully. Email patterns:' as message,
    '@chubb.com = admin role' as admin_pattern,
    '@assessor.com = assessor role' as assessor_pattern,
    'others = claimant role' as default_pattern;
