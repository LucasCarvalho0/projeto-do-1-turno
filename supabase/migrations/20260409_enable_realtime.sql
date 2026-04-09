-- Enable Realtime for productions, employees and settings tables
BEGIN;
  -- Remove the tables from publication if they are already there (to avoid errors)
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS productions;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS employees;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS settings;
  
  -- Add the tables to the supabase_realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE productions;
  ALTER PUBLICATION supabase_realtime ADD TABLE employees;
  ALTER PUBLICATION supabase_realtime ADD TABLE settings;
COMMIT;

-- Ensure RLS is enabled and allows authenticated inserts (assuming this is managed but good to check)
-- ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated inserts" ON productions FOR INSERT WITH CHECK (true);
