-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 003: People & Records
-- ============================================


-- ============================================
-- STAFF
-- ============================================

create table public.staff (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  profile_id uuid not null
    references public.profiles(id) on delete cascade,

  staff_id text not null,
  employment_date date,
  department text,
  status text not null default 'active'
    check (status in ('active', 'inactive')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, staff_id),
  unique (profile_id)
);


-- ============================================
-- PARENTS
-- ============================================

create table public.parents (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  address text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- STUDENTS
-- ============================================

create table public.students (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  class_arm_id uuid
    references public.class_arms(id) on delete set null,

  admission_number text not null,

  first_name text not null,
  last_name text not null,
  middle_name text,

  date_of_birth date,
  gender text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'graduated', 'withdrawn')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, admission_number)
);


-- ============================================
-- STUDENT ↔ PARENT RELATIONSHIP
-- ============================================

create table public.student_parents (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  parent_id uuid not null
    references public.parents(id) on delete cascade,

  relationship text,
  is_primary boolean not null default false,

  created_at timestamptz not null default now(),

  unique (student_id, parent_id)
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.staff enable row level security;

alter table public.parents enable row level security;

alter table public.students enable row level security;

alter table public.student_parents enable row level security;