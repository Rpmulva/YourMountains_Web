-- Supabase Database Schema for CAC Platform
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  provider TEXT, -- 'google', 'apple', 'email'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Diary Entries (activity tracking)
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('Hike', 'Run', 'Ski')) NOT NULL,
  duration TEXT NOT NULL,
  distance TEXT NOT NULL,
  max_speed TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries" ON public.diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON public.diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON public.diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON public.diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Feed Posts (community feed)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed posts" ON public.feed_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create feed posts" ON public.feed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feed posts" ON public.feed_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feed posts" ON public.feed_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Post Likes (many-to-many)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Claire Conversations (AI chat history)
CREATE TABLE IF NOT EXISTS public.claire_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL, -- Array of {id, text, sender, timestamp}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.claire_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.claire_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON public.claire_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.claire_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON public.diary_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_claire_conversations_user_id ON public.claire_conversations(user_id);
