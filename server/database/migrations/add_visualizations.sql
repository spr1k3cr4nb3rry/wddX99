-- Add visualizations column to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS visualizations JSONB;

-- Create index for visualizations (GIN index for JSONB queries)
CREATE INDEX IF NOT EXISTS idx_topics_visualizations ON topics USING GIN (visualizations);

