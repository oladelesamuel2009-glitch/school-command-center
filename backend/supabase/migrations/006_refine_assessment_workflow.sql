-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 006: Refine Assessment Workflow
-- ============================================


-- ============================================
-- GRADING COMPONENTS
-- max_score belongs to an assessment, not a component
-- ============================================

alter table public.grading_components
drop column if exists max_score;


-- ============================================
-- ASSESSMENTS
-- ============================================

-- Allow multiple assessments under the same
-- grading component.

alter table public.assessments
drop constraint if exists assessments_term_id_class_arm_id_subject_id_grading_component_id_key;


-- Assessment identity

alter table public.assessments
add column if not exists name text;

alter table public.assessments
add column if not exists type text;

alter table public.assessments
add column if not exists max_score numeric(6,2);


-- Assessment submission tracking

alter table public.assessments
add column if not exists submitted_by uuid
references public.staff(id) on delete restrict;

alter table public.assessments
add column if not exists submitted_at timestamptz;


-- Replace the old status rules

alter table public.assessments
drop constraint if exists assessments_status_check;

alter table public.assessments
add constraint assessments_status_check
check (
  status in (
    'draft',
    'submitted',
    'locked'
  )
);


-- Assessment validation

alter table public.assessments
add constraint assessments_name_not_empty
check (length(trim(name)) > 0);

alter table public.assessments
add constraint assessments_type_check
check (
  type in (
    'ca',
    'quiz',
    'test',
    'practical',
    'project',
    'exam',
    'other'
  )
);

alter table public.assessments
add constraint assessments_max_score_positive
check (max_score > 0);


-- ============================================
-- EXISTING DATA SAFETY
-- ============================================

-- The migration is intended for our fresh development
-- database. These values make any existing assessment
-- rows compatible with the new structure.

update public.assessments
set
  name = 'Assessment',
  type = 'other',
  max_score = 100
where name is null
   or type is null
   or max_score is null;


-- ============================================
-- REQUIRED COLUMNS
-- ============================================

alter table public.assessments
alter column name set not null;

alter table public.assessments
alter column type set not null;

alter table public.assessments
alter column max_score set not null;


-- ============================================
-- ASSESSMENT INDEXES
-- ============================================

create index if not exists idx_assessments_class_subject_term
on public.assessments (
  class_arm_id,
  subject_id,
  term_id
);

create index if not exists idx_assessments_created_by
on public.assessments (created_by);

create index if not exists idx_assessments_status
on public.assessments (status);


-- ============================================
-- SCORES
-- ============================================

create index if not exists idx_scores_assessment
on public.scores (assessment_id);

create index if not exists idx_scores_student
on public.scores (student_id);