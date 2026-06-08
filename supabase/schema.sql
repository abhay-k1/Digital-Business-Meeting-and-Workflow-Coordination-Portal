-- Drop tables if they exist (to ensure fresh migration)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  password TEXT
);

-- Create groups table
CREATE TABLE public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  "managerId" TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb
);

-- Create meetings table
CREATE TABLE public.meetings (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "groupId" TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  agenda TEXT,
  participants TEXT,
  status TEXT NOT NULL,
  "meetLink" TEXT
);

-- Create tasks table
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "groupId" TEXT,
  "assignedMemberId" TEXT,
  title TEXT NOT NULL,
  description TEXT,
  "assignedMember" TEXT NOT NULL,
  deadline TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id TEXT PRIMARY KEY,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  "fileAttachment" JSONB
);

-- Disable Row Level Security (RLS) on all tables to enable public access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Seed users
INSERT INTO public.users (id, email, name, username, password) VALUES
('1', 'demo@portal.com', 'Abhay Kamble', 'abhay', 'password'),
('1779907415345', 'vibhanshu@gmail.com', 'Vibhanshu G', 'vibhanshu', 'vibhanshu'),
('2', 'sneha@portal.com', 'Sneha Shinde', 'sneha', 'password');

-- Seed groups
INSERT INTO public.groups (id, name, code, "managerId", members) VALUES
('g_1780573099277', 'Internship Week 3', 'GRP-5274', '1', '[{"id": "1", "name": "Abhay Kamble", "email": "demo@portal.com"}, {"id": "1779907415345", "name": "Vibhanshu G", "email": "vibhanshu@gmail.com"}, {"id": "2", "name": "Sneha Shinde", "email": "sneha@portal.com"}]'::jsonb),
('g_brand_review', 'Design & Brand Alignment', 'GRP-8020', '1779907415345', '[{"id": "1779907415345", "name": "Vibhanshu G", "email": "vibhanshu@gmail.com"}, {"id": "1", "name": "Abhay Kamble", "email": "demo@portal.com"}, {"id": "2", "name": "Sneha Shinde", "email": "sneha@portal.com"}]'::jsonb),
('g_qa_sync', 'Quality Assurance Sync', 'GRP-9941', '2', '[{"id": "2", "name": "Sneha Shinde", "email": "sneha@portal.com"}, {"id": "1", "name": "Abhay Kamble", "email": "demo@portal.com"}, {"id": "1779907415345", "name": "Vibhanshu G", "email": "vibhanshu@gmail.com"}]'::jsonb);

-- Seed meetings
INSERT INTO public.meetings (id, "userId", "groupId", title, date, time, agenda, participants, status, "meetLink") VALUES
('m1', '1', 'g_1780573099277', 'Weekly Strategy Sync', '2026-06-08', '10:00', 'Review quarterly targets, plan content calendar, and discuss client onboarding workflow.', 'Abhay Kamble, Vibhanshu G, Sneha Shinde', 'Upcoming', 'https://meet.google.com/new'),
('m2', '1', 'g_1780573099277', 'UI Design Review', '2026-06-09', '14:30', 'Finalize inner page card layouts, typography alignment, and color palette validation.', 'Abhay Kamble, Sneha Shinde', 'Upcoming', 'https://meet.google.com/new'),
('m3', '1779907415345', 'g_brand_review', 'Color Palette Review', '2026-06-12', '11:00', 'Inspect dark cyan vs secondary color contrasts and approve design assets.', 'Vibhanshu G, Abhay Kamble', 'Upcoming', 'https://meet.google.com/new'),
('m4', '2', 'g_qa_sync', 'Production Deployment QA', '2026-06-15', '16:00', 'Execute end-to-end verification tests of the Kanban board, Chat polling, and Calendar widgets.', 'Sneha Shinde, Abhay Kamble, Vibhanshu G', 'Upcoming', 'https://meet.google.com/new');

-- Seed tasks
INSERT INTO public.tasks (id, "userId", "groupId", "assignedMemberId", title, description, "assignedMember", deadline, priority, status) VALUES
('t1', '1', 'g_1780573099277', '1779907415345', 'Setup JSON Local Database', 'Establish a robust file-based local storage system with helper endpoints for seamless persistence.', 'Vibhanshu G', '2026-06-10', 'High', 'In Progress'),
('t2', '1', 'g_1780573099277', '2', 'Verify Color Scheme Matching', 'Review newly designed pages to ensure perfect dark cyan aesthetics alignment.', 'Sneha Shinde', '2026-06-12', 'Medium', 'Pending'),
('t3', '1779907415345', 'g_brand_review', '1', 'Develop Icon Asset Pipeline', 'Export SVGs for dashboard widgets and integrate custom icon components in Next.js pages.', 'Abhay Kamble', '2026-06-15', 'High', 'In Progress'),
('t4', '2', 'g_qa_sync', '1', 'Stress Test API Endpoints', 'Run API benchmark scenarios for chat messages GET/POST and check file system performance.', 'Abhay Kamble', '2026-06-18', 'Low', 'Pending');

-- Seed messages
INSERT INTO public.messages (id, "groupId", "userId", "userName", content, timestamp, "fileAttachment") VALUES
('msg_i1', 'g_1780573099277', '1779907415345', 'Vibhanshu G', 'Hi all, I''ve finished setting up the local JSON database schema. Everything is persisting nicely in db.json.', '2026-06-07T09:00:00.000Z', NULL),
('msg_i2', 'g_1780573099277', '1', 'Abhay Kamble', 'Awesome Vibhanshu! Reviewing the schema design now. Looks very solid and clean.', '2026-06-07T09:05:00.000Z', NULL),
('msg_i3', 'g_1780573099277', '2', 'Sneha Shinde', 'Hello team, I''m checking the current UI progress. The Kanban board looks fantastic!', '2026-06-07T09:10:00.000Z', NULL),
('msg_i4', 'g_1780573099277', '2', 'Sneha Shinde', 'Wait, I found an issue: the colors on the header and dashboard boxes look too identical.', '2026-06-07T09:12:00.000Z', NULL),
('msg_i5', 'g_1780573099277', '2', 'Sneha Shinde', '⚠️ Blocker: I need design feedback on the colors so we can make them easier to differentiate.', '2026-06-07T09:15:00.000Z', NULL),
('msg_i6', 'g_1780573099277', '1', 'Abhay Kamble', 'No worries Sneha, I''ll help you look at that. By the way, I am exporting the SVGs for the dashboard widgets today.', '2026-06-07T09:20:00.000Z', NULL),
('msg_i7', 'g_1780573099277', '1779907415345', 'Vibhanshu G', 'Great progress. Let''s make sure we document the new contrast colors in global.css.', '2026-06-07T09:25:00.000Z', NULL),
('msg_b1', 'g_brand_review', '1779907415345', 'Vibhanshu G', 'Hello team, coordinating brand guidelines and design review here.', '2026-06-07T10:00:00.000Z', NULL),
('msg_b2', 'g_brand_review', '1', 'Abhay Kamble', 'Vibhanshu, completed the SVG exports for the new branding kit.', '2026-06-07T10:05:00.000Z', NULL),
('msg_b3', 'g_brand_review', '2', 'Sneha Shinde', 'Perfect! I''ll load them into the assets folder.', '2026-06-07T10:10:00.000Z', NULL),
('msg_b4', 'g_brand_review', '2', 'Sneha Shinde', '⚠️ Blocker: The dark cyan palette doesn''t have enough contrast against the dark background footer.', '2026-06-07T10:12:00.000Z', NULL),
('msg_b5', 'g_brand_review', '1779907415345', 'Vibhanshu G', 'I will inspect the tailwind colors or base hex codes to find a cleaner contrast value.', '2026-06-07T10:15:00.000Z', NULL),
('msg_b6', 'g_brand_review', '1', 'Abhay Kamble', 'Next up: I''m developing the icons loading pipeline so they load dynamically.', '2026-06-07T10:20:00.000Z', NULL),
('msg_q1', 'g_qa_sync', '2', 'Sneha Shinde', 'Welcome to the QA sync channel. Let''s document our test runs here.', '2026-06-07T11:00:00.000Z', NULL),
('msg_q2', 'g_qa_sync', '1', 'Abhay Kamble', 'Vibhanshu, did you run the stress tests on the database API?', '2026-06-07T11:05:00.000Z', NULL),
('msg_q3', 'g_qa_sync', '1779907415345', 'Vibhanshu G', 'Yes, Vibhanshu completed the DB benchmarking suite.', '2026-06-07T11:10:00.000Z', NULL),
('msg_q4', 'g_qa_sync', '2', 'Sneha Shinde', '⚠️ Blocker: Under high stress, the file write operations throw locking errors (EBUSY). We need to protect the file from concurrent writes.', '2026-06-07T11:15:00.000Z', NULL),
('msg_q5', 'g_qa_sync', '1', 'Abhay Kamble', 'Got it. Abhay is working on adding a retry mechanism with atomic writes today.', '2026-06-07T11:20:00.000Z', NULL);
