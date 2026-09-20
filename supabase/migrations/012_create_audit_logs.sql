-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 012: Audit Logs
-- ============================================


-- ============================================
-- 1. AUDIT LOGS
-- ============================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  actor_id uuid
    references public.staff(id) on delete set null,

  action text not null,

  entity_type text not null,

  entity_id uuid,

  old_data jsonb,

  new_data jsonb,

  metadata jsonb,

  created_at timestamptz not null default now(),

  check (length(trim(action)) > 0),

  check (length(trim(entity_type)) > 0)
);


-- ============================================
-- 2. INDEXES
-- ============================================

create index if not exists
idx_audit_logs_school
on public.audit_logs (
  school_id
);

create index if not exists
idx_audit_logs_actor
on public.audit_logs (
  actor_id
);

create index if not exists
idx_audit_logs_entity
on public.audit_logs (
  entity_type,
  entity_id
);

create index if not exists
idx_audit_logs_action
on public.audit_logs (
  action
);

create index if not exists
idx_audit_logs_created_at
on public.audit_logs (
  created_at desc
);

create index if not exists
idx_audit_logs_school_created
on public.audit_logs (
  school_id,
  created_at desc
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.audit_logs
enable row level security;