-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 011: Issues / Attention Center
-- ============================================


-- ============================================
-- 1. ISSUES
-- ============================================

create table public.issues (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  title text not null,

  description text,

  type text not null
    check (
      type in (
        'attendance',
        'academic',
        'assessment',
        'task',
        'staff',
        'student',
        'system',
        'other'
      )
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'urgent'
      )
    ),

  status text not null default 'open'
    check (
      status in (
        'open',
        'in_progress',
        'resolved',
        'dismissed'
      )
    ),

  assigned_to uuid
    references public.staff(id) on delete set null,

  created_by uuid
    references public.staff(id) on delete set null,

  resolved_by uuid
    references public.staff(id) on delete set null,

  resolution_note text,

  resolved_at timestamptz,

  related_record_type text,

  related_record_id uuid,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  check (length(trim(title)) > 0),

  check (
    status in ('resolved', 'dismissed')
    or resolved_at is null
  )
);


-- ============================================
-- 2. INDEXES
-- ============================================

create index if not exists
idx_issues_school
on public.issues (
  school_id
);

create index if not exists
idx_issues_status
on public.issues (
  status
);

create index if not exists
idx_issues_priority
on public.issues (
  priority
);

create index if not exists
idx_issues_assigned_to
on public.issues (
  assigned_to
);

create index if not exists
idx_issues_created_by
on public.issues (
  created_by
);

create index if not exists
idx_issues_school_status
on public.issues (
  school_id,
  status
);

create index if not exists
idx_issues_created_at
on public.issues (
  created_at desc
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.issues
enable row level security;