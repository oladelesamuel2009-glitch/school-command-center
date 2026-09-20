-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 004: Teacher Responsibilities
-- ============================================


-- ============================================
-- RESPONSIBILITIES
-- ============================================

create table public.responsibilities (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  staff_id uuid not null
    references public.staff(id) on delete cascade,

  class_arm_id uuid not null
    references public.class_arms(id) on delete cascade,

  subject_id uuid
    references public.subjects(id) on delete set null,

  type text not null
    check (type in (
      'subject_teacher',
      'class_teacher'
    )),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.responsibilities enable row level security;