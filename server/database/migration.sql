-- Migration: Add role-based access control
-- Run this in your PostgreSQL database

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add approval status to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Update existing users: set role based on email domain (if any exist)
UPDATE users SET role = 'educator' WHERE email LIKE '%.edu' AND role = 'user';

-- Note: You can manually set an admin later with:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@byui.edu';

