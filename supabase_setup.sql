-- JanMitra: Supabase Table Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Schemes table (English)
CREATE TABLE IF NOT EXISTS schemes (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    city TEXT,
    gender TEXT,
    age_group TEXT,
    category TEXT,
    description TEXT,
    required_docs JSONB DEFAULT '[]'::jsonb,
    filling_steps JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    details JSONB DEFAULT '[]'::jsonb,
    last_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Schemes Hindi table (pre-translated)
CREATE TABLE IF NOT EXISTS schemes_hi (
    id BIGINT PRIMARY KEY,
    name TEXT,
    state TEXT,
    city TEXT,
    gender TEXT,
    age_group TEXT,
    category TEXT,
    description TEXT,
    last_date TEXT,
    required_docs JSONB DEFAULT '[]'::jsonb,
    filling_steps JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    details JSONB DEFAULT '[]'::jsonb
);
-- Form submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id BIGSERIAL PRIMARY KEY,
    form_type TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TEXT NOT NULL
);