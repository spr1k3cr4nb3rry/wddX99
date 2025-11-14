-- Whitepaper Library

CREATE TABLE IF NOT EXISTS whitepapers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  content TEXT NOT NULL, -- Main whitepaper content (one page)
  author VARCHAR(255),
  citations JSONB DEFAULT '[]', -- Array of citation objects
  resources JSONB DEFAULT '[]', -- Array of resource objects
  tags JSONB DEFAULT '[]',
  category VARCHAR(100),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for whitepapers
CREATE INDEX IF NOT EXISTS idx_whitepapers_title ON whitepapers(title);
CREATE INDEX IF NOT EXISTS idx_whitepapers_category ON whitepapers(category);
CREATE INDEX IF NOT EXISTS idx_whitepapers_created_at ON whitepapers(created_at);
CREATE INDEX IF NOT EXISTS idx_whitepapers_tags ON whitepapers USING GIN(tags);

