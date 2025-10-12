# 🔐 Demo Users Setup Guide

## 🚨 **Current Issue**
The demo accounts (`assessor@chubb.com` / `password123`) are not working because they need to be properly created in Supabase Auth.

## 🛠️ **Solution: Complete Setup Process**

### **Step 1: Create Users in Supabase Auth Dashboard**

1. **Go to your Supabase Dashboard:** https://byizdmjuvjmqfykjwbal.supabase.co
2. **Navigate to:** Authentication → Users
3. **Click:** "Add User" (or "Invite User")
4. **Create these 3 users:**

#### **User 1: Assessor**
- **Email:** `assessor@chubb.com`
- **Password:** `password123`
- **Auto Confirm:** ✅ Check this box

#### **User 2: Admin**
- **Email:** `admin@chubb.com`
- **Password:** `password123`
- **Auto Confirm:** ✅ Check this box

#### **User 3: Claimant (Optional)**
- **Email:** `claimant@example.com`
- **Password:** `password123`
- **Auto Confirm:** ✅ Check this box

### **Step 2: Run Database Setup Script**

1. **Go to:** SQL Editor in Supabase Dashboard
2. **Copy and paste** the entire content from `setup-demo-users.sql`
3. **Click:** "Run" to execute the script

### **Step 3: Verify Setup**

1. **Go to:** Table Editor → users
2. **Verify** these users exist with correct roles:
   - `assessor@chubb.com` → role: `assessor`
   - `admin@chubb.com` → role: `admin`
   - `claimant@example.com` → role: `claimant`

### **Step 4: Test Authentication**

1. **Start your servers:**
   ```bash
   # Terminal 1 - Backend
   cd /Users/gauraangthakkar/Desktop/Megathon && source venv/bin/activate && uvicorn api:app --reload --port 8000
   
   # Terminal 2 - Frontend
   cd /Users/gauraangthakkar/Desktop/Megathon/claims-assessment-system && npm run dev
   ```

2. **Test login:**
   - Go to: http://localhost:3000/auth
   - Sign in with: `assessor@chubb.com` / `password123`
   - Should redirect to: `/assessor-portal`

## 🔧 **Alternative: Quick Fix Script**

If you want to create users programmatically, run this SQL in Supabase:

```sql
-- Create assessor user (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'assessor@chubb.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"John Smith - Senior Assessor"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create admin user (if not exists)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@chubb.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Johnson - System Administrator"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

## 🎯 **Expected Result**

After completing these steps:
- ✅ `assessor@chubb.com` / `password123` → Access to Assessor Portal
- ✅ `admin@chubb.com` / `password123` → Access to Assessor Portal (admin privileges)
- ✅ `claimant@example.com` / `password123` → Access to Claimant Portal

## 🚨 **Troubleshooting**

### **Still getting "Access Denied"?**
1. Check browser console for errors
2. Verify users exist in both `auth.users` and `public.users` tables
3. Clear browser cache and try again
4. Check if Supabase RLS is enabled (should be disabled for demo)

### **Users not appearing in public.users?**
1. Run the `setup-demo-users.sql` script again
2. Check if the trigger `handle_new_user()` is working
3. Manually insert user profiles if needed

## 📞 **Need Help?**
If you're still having issues, check:
1. Supabase project is active
2. Environment variables are correct
3. Both frontend and backend servers are running
4. Database schema is properly set up
