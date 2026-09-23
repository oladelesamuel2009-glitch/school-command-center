-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 013: Staff Invitations
-- ============================================

create table public.staff_invitations (

  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id)
    on delete cascade,

  email text not null,

  first_name text not null,

  last_name text not null,

  phone text,

  role text not null
    check (role in ('principal', 'admin', 'teacher')),

  staff_id text not null,

  department text,

  employment_date date,

  token_hash text not null,

  expires_at timestamptz not null,

  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),

  created_by uuid not null
    references public.staff(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (token_hash),

  unique (school_id, staff_id)
);


-- ============================================
-- INDEXES
-- ============================================

create index idx_staff_invitations_school
  on public.staff_invitations(school_id);

create index idx_staff_invitations_email
  on public.staff_invitations(email);

create index idx_staff_invitations_status
  on public.staff_invitations(status);

create index idx_staff_invitations_expires_at
  on public.staff_invitations(expires_at);

create index idx_staff_invitations_created_by
  on public.staff_invitations(created_by);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.staff_invitations enable row level security;