-- Chubb Claims Assessment System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE claim_status AS ENUM ('submitted', 'ai_review', 'assessor_review', 'completed', 'rejected');
CREATE TYPE claim_type AS ENUM ('collision', 'theft', 'vandalism', 'natural_disaster', 'fire', 'other');
CREATE TYPE user_role AS ENUM ('claimant', 'assessor', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'claimant',
    driving_license TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
CREATE TABLE public.claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Claim basic info
    status claim_status DEFAULT 'submitted',
    claim_type claim_type NOT NULL,
    policy_number TEXT NOT NULL,
    
    -- Vehicle information
    vehicle_make_model TEXT NOT NULL,
    vehicle_color TEXT,
    vehicle_license_plate TEXT,
    vehicle_year INTEGER,
    
    -- Incident details
    incident_date DATE NOT NULL,
    incident_time TIME,
    incident_location TEXT NOT NULL,
    incident_description TEXT NOT NULL,
    
    -- Other party details (if applicable)
    other_party_involved BOOLEAN DEFAULT FALSE,
    other_party_details TEXT,
    
    -- AI Analysis results
    ai_analysis_result JSONB,
    estimated_damage_cost DECIMAL(10,2),
    
    -- Assessor details
    assigned_assessor_id UUID REFERENCES public.users(id),
    assessor_notes TEXT,
    assessor_decision TEXT,
    final_approved_amount DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Claim images table
CREATE TABLE public.claim_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_filename TEXT,
    image_type TEXT, -- 'damage', 'scene', 'documents'
    ai_analysis JSONB, -- Store AI analysis results for this image
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim status history table
CREATE TABLE public.claim_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    previous_status claim_status,
    new_status claim_status NOT NULL,
    changed_by UUID REFERENCES public.users(id),
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessor assignments table
CREATE TABLE public.assessor_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    assessor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX idx_claims_user_id ON public.claims(user_id);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_claim_number ON public.claims(claim_number);
CREATE INDEX idx_claims_created_at ON public.claims(created_at);
CREATE INDEX idx_claim_images_claim_id ON public.claim_images(claim_id);
CREATE INDEX idx_claim_status_history_claim_id ON public.claim_status_history(claim_id);
CREATE INDEX idx_assessor_assignments_claim_id ON public.assessor_assignments(claim_id);
CREATE INDEX idx_assessor_assignments_assessor_id ON public.assessor_assignments(assessor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate claim number function
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current year
    SELECT EXTRACT(YEAR FROM NOW()) INTO counter;
    
    -- Generate claim number in format: CHB-YYYY-NNNNNN
    SELECT 'CHB-' || counter || '-' || LPAD((
        SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 10) AS INTEGER)), 0) + 1
        FROM public.claims 
        WHERE claim_number LIKE 'CHB-' || counter || '-%'
    )::TEXT, 6, '0') INTO new_number;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate claim number
CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
        NEW.claim_number := generate_claim_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_claim_number_trigger
    BEFORE INSERT ON public.claims
    FOR EACH ROW EXECUTE FUNCTION set_claim_number();

-- DISABLE RLS (Row Level Security) on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessor_assignments DISABLE ROW LEVEL SECURITY;

-- Insert sample data for testing
-- Sample assessor user
INSERT-- Verify the admin user was created
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE role = 'admin';

-- ================================
-- ADMIN DEBUG REGISTRATION SETUP
-- ================================

-- Function to automatically set admin role for specific emails
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-assign admin role for specific email domains or addresses
    IF NEW.email LIKE '%@chubb.com' OR NEW.email = 'admin@example.com' THEN
        UPDATE public.users 
        SET role = 'admin'
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign admin role after user creation
CREATE TRIGGER auto_assign_admin_role_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_admin_role();

-- Insert some demo data for testing (optional)
-- You can remove this section if you don't want demo data

-- Demo assessor user (will be created when they register)
-- Email: assessor@chubb.com, Password: (set during registration)

-- Demo claimant user (will be created when they register)  
-- Email: claimant@example.com, Password: (set during registration)
VALUES
(uuid_generate_v4(), 'assessor@chubb.com', 'John Smith', 'assessor', 'DL-14-2019-0123456', '+91-9876543210'),
(uuid_generate_v4(), 'admin@chubb.com', 'Sarah Johnson', 'admin', 'DL-14-2018-0987654', '+91-9876543211');

-- Sample claims for demo
INSERT INTO public.claims (
    claim_type, 
    policy_number, 
    vehicle_make_model, 
    vehicle_color, 
    vehicle_license_plate,
    incident_date, 
    incident_time, 
    incident_location, 
    incident_description,
    status,
    estimated_damage_cost
) VALUES 
(
    (SELECT id FROM public.users WHERE email = 'assessor@chubb.com' LIMIT 1),
    'collision',
    'CHB-VEH-2024-001234',
    'Honda City 2022',
    'White',
    'DL-01-AB-1234',
    '2024-12-10',
    '14:30:00',
    'Connaught Place, New Delhi',
    'Front-end collision with another vehicle at traffic signal. Significant damage to bumper, headlights, and hood.',
    'ai_review',
    45000.00
);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for live updates (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.claim_status_history;
