-- Add display_order column as nullable first
ALTER TABLE flashcards
ADD display_order INTEGER;

-- Update existing records with display_order based on created_at within each generation
WITH ordered_flashcards AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY generation_id ORDER BY created_at) as row_num
  FROM flashcards
)
UPDATE flashcards
SET display_order = ordered_flashcards.row_num
FROM ordered_flashcards
WHERE flashcards.id = ordered_flashcards.id;

-- Make display_order NOT NULL after populating data
UPDATE flashcards 
SET display_order = 1 
WHERE display_order IS NULL;

ALTER TABLE flashcards 
ADD CONSTRAINT display_order_not_null 
CHECK (display_order IS NOT NULL);

-- Add an index to improve order-based queries
CREATE INDEX idx_flashcards_generation_order ON flashcards(generation_id, display_order);

-- Add a constraint to ensure display_order is positive
ALTER TABLE flashcards
ADD CONSTRAINT check_display_order_positive CHECK (display_order > 0); 