-- Migration: Add abstract and status columns to topics table
-- Run this SQL to add support for full article content and status tracking

-- Add abstract column for article abstracts
ALTER TABLE topics ADD COLUMN IF NOT EXISTS abstract TEXT;

-- Note: status column already exists in schema.sql with DEFAULT 'Active'
-- We'll update it to support: 'draft', 'pending', 'published', 'approved', 'rejected'
-- If status column doesn't exist, create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'topics' AND column_name = 'status') THEN
    ALTER TABLE topics ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
  END IF;
END $$;

-- Update existing topics to have appropriate status based on approved column
-- If approved column exists and is true, set status to 'published'
-- If approved column exists and is false/null, set status to 'pending'
-- Otherwise keep existing status
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'topics' AND column_name = 'approved') THEN
    UPDATE topics 
    SET status = CASE 
      WHEN approved = true THEN 'published'
      WHEN approved = false OR approved IS NULL THEN 'pending'
      WHEN status IS NULL OR status = '' THEN 'pending'
      ELSE status
    END
    WHERE status IS NULL OR status = '' OR status = 'Active';
  ELSE
    -- If approved column doesn't exist, just set default status
    UPDATE topics 
    SET status = 'pending'
    WHERE status IS NULL OR status = '' OR status = 'Active';
  END IF;
END $$;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);

