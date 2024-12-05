-- Add created_by and created_at columns to groups table
ALTER TABLE groups
ADD COLUMN created_by UUID REFERENCES auth.users(id),
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 