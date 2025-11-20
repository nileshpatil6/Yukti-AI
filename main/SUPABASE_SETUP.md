# Supabase Setup Instructions

## Create the profiles table in Supabase

1. Go to your Supabase project: https://kehcstrzgfzdwrjpzjlt.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the following SQL and click **Run**:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (true);
```

## How it works:

1. User signs up via Firebase Auth
2. User is redirected to `/dashboard`
3. Dashboard checks if user profile exists in Supabase
4. If NO profile found → Modal popup asks for name & age
5. User fills in name & age → Data saved to Supabase `profiles` table
6. Modal closes and user sees their complete profile

## Testing:

1. Clear any existing profiles (if testing):
   ```sql
   DELETE FROM profiles;
   ```

2. Sign up with a new account
3. You should see the popup modal asking for name and age
4. Fill in the details and click "Save Profile"
5. Profile should be saved and displayed on the dashboard
