-- Migration: Add customization settings column to topics table
-- This stores typography, layout template, color scheme, and other customizations

ALTER TABLE topics ADD COLUMN IF NOT EXISTS customization_settings JSONB DEFAULT '{}';

-- Create index for customization settings (GIN index for JSONB queries)
CREATE INDEX IF NOT EXISTS idx_topics_customization_settings ON topics USING GIN (customization_settings);

-- Example structure for customization_settings:
-- {
--   "typography": {
--     "fontSize": "medium", // small, medium, large, xlarge
--     "lineHeight": "normal", // tight, normal, relaxed
--     "fontFamily": "serif", // serif, sans-serif, monospace
--     "textWidth": "medium" // narrow, medium, wide, full
--   },
--   "layout": "classic", // classic, magazine, blog
--   "colorScheme": "academic-blue", // academic-blue, modern-dark, warm-earth, high-contrast, custom
--   "customColors": {
--     "primary": "#006EB6",
--     "secondary": "#214491"
--   },
--   "headerStyle": "with-author", // minimal, with-author, with-image-overlay, centered
--   "imageDisplay": "full-width", // full-width, contained, side-by-side, floating-left, floating-right, gallery
--   "sectionDividers": "thin-line" // none, thin-line, thick-line, decorative, image
-- }

