-- Create the group_types table
CREATE TABLE IF NOT EXISTS group_types (
    id SERIAL PRIMARY KEY,
    group_type VARCHAR(255) NOT NULL,
    sub_types JSONB DEFAULT '[]'::jsonb
);

-- Add RLS policies
ALTER TABLE group_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read group_types
CREATE POLICY "Allow all authenticated users to read group_types"
ON group_types FOR SELECT
TO authenticated
USING (true);

-- Allow only admins to insert/update/delete group_types
CREATE POLICY "Allow admins to manage group_types"
ON group_types FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
    )
);

-- Add foreign key to groups table if it doesn't exist
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS group_type_id INTEGER REFERENCES group_types(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_group_type_id ON groups(group_type_id); 