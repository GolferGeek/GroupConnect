-- Add group_type_id column to groups table
ALTER TABLE groups
ADD COLUMN group_type_id INTEGER REFERENCES group_types(id);

-- Make group_type_id required for new groups but allow null for existing ones
-- After migrating existing groups, you can make it NOT NULL if desired
-- ALTER TABLE groups ALTER COLUMN group_type_id SET NOT NULL; 