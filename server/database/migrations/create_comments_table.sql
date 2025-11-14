-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Create indexes for better query performance (only if table was just created)
-- Note: These will fail if indexes already exist, which is fine
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_topic_id') THEN
    CREATE INDEX idx_comments_topic_id ON comments(topic_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_user_id') THEN
    CREATE INDEX idx_comments_user_id ON comments(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_parent_id') THEN
    CREATE INDEX idx_comments_parent_id ON comments(parent_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_created_at') THEN
    CREATE INDEX idx_comments_created_at ON comments(created_at);
  END IF;
END $$;

-- Add comment count to topics table (optional, for faster queries)
-- This can be calculated on the fly, but having a cached count is useful
ALTER TABLE topics ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
