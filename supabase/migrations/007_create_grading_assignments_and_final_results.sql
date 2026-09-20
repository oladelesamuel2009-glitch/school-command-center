-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 007: Grading Assignments & Final Results
-- ============================================


-- ============================================
-- 1. GRADING SYSTEM ASSIGNMENTS
-- One grading system per class arm per term
-- ============================================

create table public.grading_system_assignments (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete restrict,

  term_id uuid not null
    references public.terms(id) on delete restrict,

  class_arm_id uuid not null
    references public.class_arms(id) on delete restrict,

  grading_system_id uuid not null
    references public.grading_systems(id) on delete restrict,

  assigned_by uuid not null
    references public.staff(id) on delete restrict,

  assigned_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  unique (term_id, class_arm_id)
);


-- ============================================
-- 2. RESULT SUBMISSIONS
-- Final subject result submission for a class/term
-- ============================================

create table public.final_result_submissions (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete restrict,

  term_id uuid not null
    references public.terms(id) on delete restrict,

  class_arm_id uuid not null
    references public.class_arms(id) on delete restrict,

  subject_id uuid not null
    references public.subjects(id) on delete restrict,

  submitted_by uuid not null
    references public.staff(id) on delete restrict,

  submitted_at timestamptz not null default now(),

  status text not null default 'submitted'
    check (
      status in (
        'submitted',
        'approved',
        'rejected',
        'published'
      )
    ),

  reviewed_by uuid
    references public.staff(id) on delete set null,

  reviewed_at timestamptz,

  review_comment text,

  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (term_id, class_arm_id, subject_id)
);


-- ============================================
-- 3. FINAL RESULTS
-- One official subject result per student/term
-- ============================================

create table public.final_results (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  academic_session_id uuid not null
    references public.academic_sessions(id) on delete restrict,

  term_id uuid not null
    references public.terms(id) on delete restrict,

  class_arm_id uuid not null
    references public.class_arms(id) on delete restrict,

  subject_id uuid not null
    references public.subjects(id) on delete restrict,

  student_id uuid not null
    references public.students(id) on delete restrict,

  final_result_submission_id uuid
    references public.final_result_submissions(id) on delete restrict,

  final_score numeric(6,2)
    check (
      final_score >= 0
      and final_score <= 100
    ),

  grade text,

  remark text,

  status text not null default 'calculated'
    check (
      status in (
        'calculated',
        'submitted',
        'approved',
        'published'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (term_id, class_arm_id, subject_id, student_id)
);


-- ============================================
-- 4. RESULT COMPONENTS
-- Preserves how the final result was calculated
-- ============================================

create table public.result_components (
  id uuid primary key default gen_random_uuid(),

  final_result_id uuid not null
    references public.final_results(id) on delete cascade,

  grading_component_id uuid
    references public.grading_components(id) on delete set null,

  component_name text not null,

  component_weight numeric(5,2) not null
    check (
      component_weight > 0
      and component_weight <= 100
    ),

  component_average numeric(6,2)
    check (
      component_average >= 0
      and component_average <= 100
    ),

  contribution numeric(6,2)
    check (
      contribution >= 0
      and contribution <= 100
    ),

  status text not null default 'resolved'
    check (
      status in (
        'resolved',
        'pending',
        'not_applicable'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (final_result_id, grading_component_id)
);


-- ============================================
-- 5. IMPROVE SCORE STATUS HANDLING
-- Score and attendance/status are separate
-- ============================================

alter table public.scores
alter column score drop not null;

alter table public.scores
add column if not exists status text not null default 'scored';

alter table public.scores
add constraint scores_status_check
check (
  status in (
    'scored',
    'absent',
    'excused',
    'missing'
  )
);

alter table public.scores
add constraint scores_status_value_check
check (
  (status = 'scored' and score is not null)
  or
  (status in ('absent', 'excused', 'missing'))
);


-- ============================================
-- 6. INDEXES
-- ============================================

create index if not exists
idx_grading_assignments_school
on public.grading_system_assignments (school_id);

create index if not exists
idx_grading_assignments_term_class
on public.grading_system_assignments (
  term_id,
  class_arm_id
);

create index if not exists
idx_final_submissions_term_class
on public.final_result_submissions (
  term_id,
  class_arm_id
);

create index if not exists
idx_final_submissions_subject
on public.final_result_submissions (subject_id);

create index if not exists
idx_final_results_student
on public.final_results (student_id);

create index if not exists
idx_final_results_subject
on public.final_results (subject_id);

create index if not exists
idx_final_results_term_class
on public.final_results (
  term_id,
  class_arm_id
);

create index if not exists
idx_result_components_final_result
on public.result_components (final_result_id);


-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.grading_system_assignments
enable row level security;

alter table public.final_result_submissions
enable row level security;

alter table public.final_results
enable row level security;

alter table public.result_components
enable row level security;


-- ============================================
-- 8. PROTECT ASSIGNED GRADING SYSTEMS
--
-- Once a grading system is used by a term/class,
-- its configuration cannot be casually changed.
-- Future terms can use a different grading system.
-- ============================================

create or replace function public.prevent_locked_grading_system_changes()
returns trigger
language plpgsql
as $$
begin

  if exists (
    select 1
    from public.grading_system_assignments
    where grading_system_id = old.id
  ) then

    raise exception
      'This grading system is already assigned to a term and is locked';

  end if;

  return new;

end;
$$;


create or replace function public.prevent_locked_grading_component_changes()
returns trigger
language plpgsql
as $$
begin

  if exists (
    select 1
    from public.grading_system_assignments gsa
    join public.grading_components gc
      on gc.grading_system_id = gsa.grading_system_id
    where gc.id = old.id
  ) then

    raise exception
      'This grading component belongs to a locked grading system';

  end if;

  return new;

end;
$$;


create or replace function public.prevent_locked_grade_boundary_changes()
returns trigger
language plpgsql
as $$
begin

  if exists (
    select 1
    from public.grading_system_assignments gsa
    where gsa.grading_system_id = old.grading_system_id
  ) then

    raise exception
      'This grade boundary belongs to a locked grading system';

  end if;

  return new;

end;
$$;


-- ============================================
-- 9. TRIGGERS FOR LOCKING
-- ============================================

drop trigger if exists
lock_grading_system_after_assignment
on public.grading_systems;

create trigger
lock_grading_system_after_assignment
before update or delete
on public.grading_systems
for each row
execute function public.prevent_locked_grading_system_changes();


drop trigger if exists
lock_grading_component_after_assignment
on public.grading_components;

create trigger
lock_grading_component_after_assignment
before update or delete
on public.grading_components
for each row
execute function public.prevent_locked_grading_component_changes();


drop trigger if exists
lock_grade_boundary_after_assignment
on public.grade_boundaries;

create trigger
lock_grade_boundary_after_assignment
before update or delete
on public.grade_boundaries
for each row
execute function public.prevent_locked_grade_boundary_changes();