-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 001: Schools & Profiles
-- ============================================

-- ============================================
-- SCHOOLS
-- ============================================

create table public.schools (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  address text,
  phone text,
  email text,
  logo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- PROFILES
-- ============================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  school_id uuid not null references public.schools(id) on delete cascade,

  first_name text not null,
  last_name text not null,
  phone text,

  role text not null
    check (role in (
      'proprietor',
      'principal',
      'admin',
      'teacher'
    )),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.schools enable row level security;

alter table public.profiles enable row level security;