-- Migration: Add content_blocks column to topics table
-- This stores pull quotes, CTA boxes, info boxes, code blocks, and image galleries

ALTER TABLE topics ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]';

-- Create index for content blocks (GIN index for JSONB queries)
CREATE INDEX IF NOT EXISTS idx_topics_content_blocks ON topics USING GIN (content_blocks);

