-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_topic_id ON bookmarks(topic_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at);

-- Add bookmark_count to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0;

-- Create a function to update bookmark count
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET bookmark_count = bookmark_count + 1 WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET bookmark_count = GREATEST(0, bookmark_count - 1) WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update bookmark count
DROP TRIGGER IF EXISTS trigger_update_bookmark_count ON bookmarks;
CREATE TRIGGER trigger_update_bookmark_count
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_bookmark_count();



