-- Delete all topics and related data
-- WARNING: This will permanently delete ALL topics, votes, comments, and bookmarks

-- Delete votes first (foreign key constraint)
DELETE FROM votes;

-- Delete comments first (foreign key constraint)
DELETE FROM comments;

-- Delete bookmarks if the table exists (foreign key constraint)
-- Uncomment if you have a bookmarks table
-- DELETE FROM bookmarks;

-- Delete all topics
DELETE FROM topics;

-- Reset sequences (optional, but good practice)
-- ALTER SEQUENCE topics_id_seq RESTART WITH 1;
-- ALTER SEQUENCE votes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE comments_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_topics FROM topics;
SELECT COUNT(*) as remaining_votes FROM votes;
SELECT COUNT(*) as remaining_comments FROM comments;

