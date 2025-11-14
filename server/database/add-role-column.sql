-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add approval status to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Update existing users: set role based on email domain
UPDATE users SET role = 'educator' WHERE email LIKE '%.edu';
UPDATE users SET role = 'admin' WHERE email = 'admin@byui.edu'; -- Set your admin email here

