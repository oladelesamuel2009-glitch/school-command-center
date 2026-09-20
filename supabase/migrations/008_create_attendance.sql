-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 008: Attendance
-- ============================================


-- ============================================
-- 1. ATTENDANCE RECORDS
-- One record per student per school day
-- ============================================

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete restrict,

  term_id uuid not null
    references public.terms(id) on delete restrict,

  class_arm_id uuid not null
    references public.class_arms(id) on delete restrict,

  student_id uuid not null
    references public.students(id) on delete restrict,

  attendance_date date not null,

  status text not null
    check (
      status in (
        'present',
        'absent',
        'late',
        'excused'
      )
    ),

  recorded_by uuid not null
    references public.staff(id) on delete restrict,

  recorded_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  note text,

  unique (student_id, attendance_date)
);


-- ============================================
-- 2. INDEXES
-- ============================================

create index if not exists
idx_attendance_school_date
on public.attendance_records (
  school_id,
  attendance_date
);

create index if not exists
idx_attendance_class_date
on public.attendance_records (
  class_arm_id,
  attendance_date
);

create index if not exists
idx_attendance_student_date
on public.attendance_records (
  student_id,
  attendance_date
);

create index if not exists
idx_attendance_recorded_by
on public.attendance_records (
  recorded_by
);

create index if not exists
idx_attendance_status
on public.attendance_records (
  status
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.attendance_records
enable row level security;