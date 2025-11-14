-- Enhanced Voting System
-- Supports yes/no voting with group-based tracking

-- Add user_group column to users table (teacher, expert, educator, admin, user)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_group VARCHAR(50) DEFAULT 'user';

-- Enhanced votes table for yes/no voting
CREATE TABLE IF NOT EXISTS proposition_votes (
  id SERIAL PRIMARY KEY,
  proposition_id INTEGER NOT NULL, -- References topics or surveys
  proposition_type VARCHAR(50) NOT NULL, -- 'topic', 'survey_question', 'research_proposal'
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vote_value VARCHAR(10) NOT NULL CHECK (vote_value IN ('yes', 'no')),
  user_group VARCHAR(50), -- Denormalized for performance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposition_id, proposition_type, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposition_votes_proposition ON proposition_votes(proposition_id, proposition_type);
CREATE INDEX IF NOT EXISTS idx_proposition_votes_user ON proposition_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_proposition_votes_group ON proposition_votes(user_group);
CREATE INDEX IF NOT EXISTS idx_users_user_group ON users(user_group);

-- Surveys table (for admin-created surveys)
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}', -- Survey settings (public/private, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'yes_no', -- 'yes_no', 'multiple_choice', etc.
  options JSONB DEFAULT '[]', -- For multiple choice questions
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research proposals table
CREATE TABLE IF NOT EXISTS research_proposals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  budget_amount DECIMAL(12, 2),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research proposal votes (which proposal would you fund with $1M)
CREATE TABLE IF NOT EXISTS research_proposal_votes (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER REFERENCES research_proposals(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_group VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposal_id, user_id)
);

-- Create indexes for research proposals
CREATE INDEX IF NOT EXISTS idx_research_proposal_votes_proposal ON research_proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_research_proposal_votes_user ON research_proposal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_research_proposal_votes_group ON research_proposal_votes(user_group);

