-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 005: Grading & Results
-- ============================================


-- ============================================
-- GRADING SYSTEMS
-- ============================================

create table public.grading_systems (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  name text not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (school_id, name)
);


-- ============================================
-- GRADING COMPONENTS
-- ============================================

create table public.grading_components (
  id uuid primary key default gen_random_uuid(),

  grading_system_id uuid not null
    references public.grading_systems(id) on delete cascade,

  name text not null,

  weight numeric(5,2) not null
    check (weight > 0 and weight <= 100),

  max_score numeric(6,2) not null
    check (max_score > 0),

  position integer not null
    check (position > 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grading_system_id, name),
  unique (grading_system_id, position)
);


-- ============================================
-- GRADE BOUNDARIES
-- ============================================

create table public.grade_boundaries (
  id uuid primary key default gen_random_uuid(),

  grading_system_id uuid not null
    references public.grading_systems(id) on delete cascade,

  grade text not null,

  min_score numeric(5,2) not null
    check (min_score >= 0 and min_score <= 100),

  max_score numeric(5,2) not null
    check (max_score >= 0 and max_score <= 100),

  remark text,

  created_at timestamptz not null default now(),

  check (max_score >= min_score),

  unique (grading_system_id, grade)
);


-- ============================================
-- ASSESSMENTS
-- ============================================

create table public.assessments (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete cascade,

  term_id uuid not null
    references public.terms(id) on delete cascade,

  class_arm_id uuid not null
    references public.class_arms(id) on delete cascade,

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  grading_component_id uuid not null
    references public.grading_components(id) on delete restrict,

  created_by uuid not null
    references public.staff(id) on delete restrict,

  status text not null default 'draft'
    check (status in (
      'draft',
      'open',
      'closed'
    )),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (
    term_id,
    class_arm_id,
    subject_id,
    grading_component_id
  )
);


-- ============================================
-- SCORES
-- ============================================

create table public.scores (
  id uuid primary key default gen_random_uuid(),

  assessment_id uuid not null
    references public.assessments(id) on delete cascade,

  student_id uuid not null
    references public.students(id) on delete cascade,

  score numeric(6,2) not null
    check (score >= 0),

  entered_by uuid not null
    references public.staff(id) on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (assessment_id, student_id)
);


-- ============================================
-- RESULT SUBMISSIONS
-- ============================================

create table public.result_submissions (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete cascade,

  term_id uuid not null
    references public.terms(id) on delete cascade,

  class_arm_id uuid not null
    references public.class_arms(id) on delete cascade,

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  submitted_by uuid not null
    references public.staff(id) on delete restrict,

  status text not null default 'submitted'
    check (status in (
      'submitted',
      'approved',
      'rejected'
    )),

  reviewed_by uuid
    references public.staff(id) on delete set null,

  reviewed_at timestamptz,

  review_comment text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.grading_systems enable row level security;

alter table public.grading_components enable row level security;

alter table public.grade_boundaries enable row level security;

alter table public.assessments enable row level security;

alter table public.scores enable row level security;

alter table public.result_submissions enable row level security;