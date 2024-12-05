-- First, create a roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert the roles
INSERT INTO roles (id, name) VALUES
  (1, 'admin'),
  (2, 'member')
ON CONFLICT (id) DO NOTHING;

-- Add a temporary column to store the new integer role_id
ALTER TABLE profiles ADD COLUMN role_id_new INTEGER;

-- Update the new column based on the text values
UPDATE profiles 
SET role_id_new = CASE 
  WHEN role_id = 'admin' THEN 1 
  ELSE 2 
END;

-- Drop the old role_id column
ALTER TABLE profiles DROP COLUMN role_id;

-- Rename the new column to role_id
ALTER TABLE profiles RENAME COLUMN role_id_new TO role_id;

-- Add foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT fk_role 
FOREIGN KEY (role_id) 
REFERENCES roles(id);

-- Set default value for new profiles
ALTER TABLE profiles 
ALTER COLUMN role_id 
SET DEFAULT 2; 