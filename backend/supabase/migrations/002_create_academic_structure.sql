-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 002: Academic Structure
-- ============================================


-- ============================================
-- ACADEMIC SESSIONS
-- ============================================

create table public.academic_sessions (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  name text not null,
  start_date date,
  end_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, name)
);


-- ============================================
-- TERMS
-- ============================================

create table public.terms (
  id uuid primary key default gen_random_uuid(),

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete cascade,

  name text not null,
  start_date date,
  end_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (academic_session_id, name)
);


-- ============================================
-- CLASSES
-- ============================================

create table public.classes (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  name text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, name)
);


-- ============================================
-- CLASS ARMS
-- ============================================

create table public.class_arms (
  id uuid primary key default gen_random_uuid(),

  class_id uuid not null
    references public.classes(id) on delete cascade,

  name text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (class_id, name)
);


-- ============================================
-- SUBJECTS
-- ============================================

create table public.subjects (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  name text not null,
  code text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, name)
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.academic_sessions enable row level security;

alter table public.terms enable row level security;

alter table public.classes enable row level security;

alter table public.class_arms enable row level security;

alter table public.subjects enable row level security;