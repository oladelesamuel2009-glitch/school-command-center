-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 009: Teacher Tasks & Deadlines
-- ============================================


-- ============================================
-- 1. TASKS
-- ============================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  title text not null,

  description text,

  assigned_to uuid not null
    references public.staff(id) on delete restrict,

  created_by uuid not null
    references public.staff(id) on delete restrict,

  due_at timestamptz,

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'urgent'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'in_progress',
        'completed',
        'cancelled'
      )
    ),

  completed_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  check (length(trim(title)) > 0),

  check (
    status = 'completed'
    or completed_at is null
  )
);


-- ============================================
-- 2. INDEXES
-- ============================================

create index if not exists
idx_tasks_school
on public.tasks (
  school_id
);

create index if not exists
idx_tasks_assigned_to
on public.tasks (
  assigned_to
);

create index if not exists
idx_tasks_created_by
on public.tasks (
  created_by
);

create index if not exists
idx_tasks_status
on public.tasks (
  status
);

create index if not exists
idx_tasks_due_at
on public.tasks (
  due_at
);

create index if not exists
idx_tasks_school_status_due
on public.tasks (
  school_id,
  status,
  due_at
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.tasks
enable row level security;