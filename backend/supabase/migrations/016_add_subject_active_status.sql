-- Migration 016
-- Add active status to subjects

alter table public.subjects
add column if not exists active boolean not null default true;

create index if not exists idx_subjects_school_active
on public.subjects (school_id, active);