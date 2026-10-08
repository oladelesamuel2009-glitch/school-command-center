-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 014: Student & Subject Enrollments
-- ============================================


-- ============================================
-- 1. STUDENT CLASS ENROLLMENTS
-- Historical record of which class arm a student
-- belonged to over time.
-- ============================================

create table public.student_class_enrollments (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  class_arm_id uuid not null
    references public.class_arms(id) on delete restrict,

  started_at timestamptz not null default now(),

  ended_at timestamptz,

  status text not null default 'active'
    check (status in ('active', 'ended')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (status = 'active' and ended_at is null)
    or
    (status = 'ended' and ended_at is not null)
  ),

  check (
    ended_at is null
    or ended_at >= started_at
  )
);


-- ============================================
-- 2. CLASS ARM SUBJECTS
-- Defines which subjects are available to a
-- particular class arm and whether they are
-- compulsory or elective.
-- ============================================

create table public.class_arm_subjects (
  id uuid primary key default gen_random_uuid(),

  class_arm_id uuid not null
    references public.class_arms(id) on delete cascade,

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  type text not null
    check (type in ('compulsory', 'elective')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (class_arm_id, subject_id)
);


-- ============================================
-- 3. STUDENT SUBJECT ENROLLMENTS
-- Historical record of subjects a student takes.
-- Links the student to a configured subject for
-- their class arm.
-- ============================================

create table public.student_subject_enrollments (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  class_arm_subject_id uuid not null
    references public.class_arm_subjects(id) on delete restrict,

  enrollment_started_at timestamptz not null default now(),

  enrollment_ended_at timestamptz,

  status text not null default 'active'
    check (status in ('active', 'ended')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (status = 'active' and enrollment_ended_at is null)
    or
    (status = 'ended' and enrollment_ended_at is not null)
  ),

  check (
    enrollment_ended_at is null
    or enrollment_ended_at >= enrollment_started_at
  )
);


-- ============================================
-- 4. INDEXES
-- ============================================

create index idx_student_class_enrollments_student
on public.student_class_enrollments (student_id);

create index idx_student_class_enrollments_class_arm
on public.student_class_enrollments (class_arm_id);

create index idx_student_class_enrollments_status
on public.student_class_enrollments (status);

create index idx_class_arm_subjects_class_arm
on public.class_arm_subjects (class_arm_id);

create index idx_class_arm_subjects_subject
on public.class_arm_subjects (subject_id);

create index idx_student_subject_enrollments_student
on public.student_subject_enrollments (student_id);

create index idx_student_subject_enrollments_class_arm_subject
on public.student_subject_enrollments (class_arm_subject_id);

create index idx_student_subject_enrollments_status
on public.student_subject_enrollments (status);


-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

alter table public.student_class_enrollments
enable row level security;

alter table public.class_arm_subjects
enable row level security;

alter table public.student_subject_enrollments
enable row level security;


-- ============================================
-- 6. TABLE GRANTS
-- ============================================

grant select, insert, update, delete
on public.student_class_enrollments
to service_role;

grant select, insert, update, delete
on public.student_class_enrollments
to authenticated;

grant select, insert, update, delete
on public.class_arm_subjects
to service_role;

grant select, insert, update, delete
on public.class_arm_subjects
to authenticated;

grant select, insert, update, delete
on public.student_subject_enrollments
to service_role;

grant select, insert, update, delete
on public.student_subject_enrollments
to authenticated;


-- ============================================
-- 7. PREVENT MULTIPLE ACTIVE CLASS ENROLLMENTS
-- A student may have only one active class arm.
-- ============================================

create unique index
idx_one_active_class_enrollment_per_student
on public.student_class_enrollments (student_id)
where status = 'active';


-- ============================================
-- 8. PREVENT MULTIPLE ACTIVE SUBJECT ENROLLMENTS
-- A student cannot be actively enrolled twice in
-- the same configured class-arm subject.
-- ============================================

create unique index
idx_one_active_subject_enrollment
on public.student_subject_enrollments (
  student_id,
  class_arm_subject_id
)
where status = 'active';


-- ============================================
-- END OF MIGRATION 014
-- ============================================