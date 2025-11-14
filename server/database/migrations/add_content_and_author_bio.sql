-- Migration: Add content and author_bio columns to topics table
-- Run this SQL to add support for full article content structure

-- Add content column for storing sections and references as JSONB
ALTER TABLE topics ADD COLUMN IF NOT EXISTS content JSONB;

-- Add author_bio column for author biography
ALTER TABLE topics ADD COLUMN IF NOT EXISTS author_bio TEXT;

-- Create index on content for faster queries (optional, but helpful for searching)
CREATE INDEX IF NOT EXISTS idx_topics_content ON topics USING GIN (content);

