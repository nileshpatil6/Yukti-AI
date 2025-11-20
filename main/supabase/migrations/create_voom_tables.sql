-- Create voom_rooms table
CREATE TABLE IF NOT EXISTS voom_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  total_questions INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  icon TEXT DEFAULT '🎯',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voom_questions table
CREATE TABLE IF NOT EXISTS voom_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES voom_rooms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 10,
  category TEXT,
  sample_input TEXT,
  sample_output TEXT,
  expected_format TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voom_user_progress table
CREATE TABLE IF NOT EXISTS voom_user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES voom_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  questions_solved INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_solved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create voom_submissions table
CREATE TABLE IF NOT EXISTS voom_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES voom_rooms(id) ON DELETE CASCADE,
  question_id UUID REFERENCES voom_questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  submission_data JSONB,
  points_earned INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, question_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voom_rooms_dates ON voom_rooms(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_voom_questions_room ON voom_questions(room_id);
CREATE INDEX IF NOT EXISTS idx_voom_progress_room ON voom_user_progress(room_id);
CREATE INDEX IF NOT EXISTS idx_voom_progress_user ON voom_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_voom_progress_leaderboard ON voom_user_progress(room_id, questions_solved DESC, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_voom_submissions_room_user ON voom_submissions(room_id, user_id);

-- Enable Row Level Security
ALTER TABLE voom_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE voom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voom_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE voom_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for voom_rooms
CREATE POLICY "Allow read access to all users" ON voom_rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON voom_rooms
  FOR INSERT WITH CHECK (true);

-- Create policies for voom_questions
CREATE POLICY "Allow read access to all users" ON voom_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON voom_questions
  FOR INSERT WITH CHECK (true);

-- Create policies for voom_user_progress
CREATE POLICY "Allow read access to all users" ON voom_user_progress
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON voom_user_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own progress" ON voom_user_progress
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Create policies for voom_submissions
CREATE POLICY "Allow read access to all users" ON voom_submissions
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON voom_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own submissions" ON voom_submissions
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Insert some sample rooms
INSERT INTO voom_rooms (topic, description, difficulty, total_questions, starts_at, ends_at, icon) VALUES
  ('Data Structures & Algorithms', 'Master fundamental DSA concepts with hands-on problems', 'Medium', 10, NOW(), NOW() + INTERVAL '24 hours', '📊'),
  ('Web Development Basics', 'Build your foundation in HTML, CSS, and JavaScript', 'Easy', 8, NOW(), NOW() + INTERVAL '24 hours', '🌐'),
  ('Machine Learning Fundamentals', 'Dive into ML algorithms and model building', 'Hard', 12, NOW(), NOW() + INTERVAL '24 hours', '🤖'),
  ('Python Programming', 'Enhance your Python skills with challenging problems', 'Medium', 10, NOW(), NOW() + INTERVAL '24 hours', '🐍'),
  ('Database Design', 'Learn SQL and database optimization techniques', 'Medium', 9, NOW(), NOW() + INTERVAL '24 hours', '🗄️');

-- Insert sample questions for Data Structures room
INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement a function to reverse a linked list', 'easy', 10, 'Linked Lists'
FROM voom_rooms WHERE topic = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Write a function to detect a cycle in a linked list', 'medium', 20, 'Linked Lists'
FROM voom_rooms WHERE topic = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement a binary search tree with insert and search operations', 'medium', 25, 'Trees'
FROM voom_rooms WHERE topic = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Find the kth largest element in an unsorted array', 'hard', 30, 'Arrays'
FROM voom_rooms WHERE topic = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement a stack using two queues', 'medium', 20, 'Stacks & Queues'
FROM voom_rooms WHERE topic = 'Data Structures & Algorithms' LIMIT 1;

-- Insert sample questions for Web Development room
INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Create a responsive navigation bar using HTML and CSS', 'easy', 10, 'HTML/CSS'
FROM voom_rooms WHERE topic = 'Web Development Basics' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Build a todo list application with add and delete functionality', 'easy', 15, 'JavaScript'
FROM voom_rooms WHERE topic = 'Web Development Basics' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement a form validator that checks email and password strength', 'medium', 20, 'JavaScript'
FROM voom_rooms WHERE topic = 'Web Development Basics' LIMIT 1;

-- Insert sample questions for Machine Learning room
INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement linear regression from scratch without using libraries', 'hard', 35, 'Supervised Learning'
FROM voom_rooms WHERE topic = 'Machine Learning Fundamentals' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Build a k-means clustering algorithm for customer segmentation', 'hard', 40, 'Unsupervised Learning'
FROM voom_rooms WHERE topic = 'Machine Learning Fundamentals' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Create a decision tree classifier and calculate its accuracy', 'medium', 25, 'Classification'
FROM voom_rooms WHERE topic = 'Machine Learning Fundamentals' LIMIT 1;

-- Insert sample questions for Python room
INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Write a decorator that measures function execution time', 'medium', 20, 'Decorators'
FROM voom_rooms WHERE topic = 'Python Programming' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Implement a context manager for file handling', 'medium', 20, 'Context Managers'
FROM voom_rooms WHERE topic = 'Python Programming' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Create a generator function that yields Fibonacci numbers', 'easy', 15, 'Generators'
FROM voom_rooms WHERE topic = 'Python Programming' LIMIT 1;

-- Insert sample questions for Database room
INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Write a SQL query to find the second highest salary from an employees table', 'medium', 20, 'SQL Queries'
FROM voom_rooms WHERE topic = 'Database Design' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Design a normalized database schema for an e-commerce platform', 'hard', 30, 'Schema Design'
FROM voom_rooms WHERE topic = 'Database Design' LIMIT 1;

INSERT INTO voom_questions (room_id, question_text, difficulty, points, category) 
SELECT id, 'Optimize a slow query that joins multiple tables', 'medium', 25, 'Query Optimization'
FROM voom_rooms WHERE topic = 'Database Design' LIMIT 1;

-- Update total_questions count for each room
UPDATE voom_rooms SET total_questions = (
  SELECT COUNT(*) FROM voom_questions WHERE voom_questions.room_id = voom_rooms.id
);
