-- ============================================
-- SCHOOL COMMAND CENTER
-- Migration 010: Notifications
-- ============================================


-- ============================================
-- 1. NOTIFICATIONS
-- ============================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  school_id uuid not null
    references public.schools(id) on delete cascade,

  recipient_id uuid not null
    references public.staff(id) on delete cascade,

  title text not null,

  message text not null,

  type text not null
    check (
      type in (
        'task',
        'assessment',
        'attendance',
        'result',
        'system',
        'issue'
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

  is_read boolean not null default false,

  read_at timestamptz,

  related_record_type text,

  related_record_id uuid,

  created_at timestamptz not null default now(),

  check (length(trim(title)) > 0),

  check (length(trim(message)) > 0),

  check (
    is_read = true
    or read_at is null
  )
);


-- ============================================
-- 2. INDEXES
-- ============================================

create index if not exists
idx_notifications_recipient
on public.notifications (
  recipient_id
);

create index if not exists
idx_notifications_recipient_read
on public.notifications (
  recipient_id,
  is_read
);

create index if not exists
idx_notifications_school
on public.notifications (
  school_id
);

create index if not exists
idx_notifications_created_at
on public.notifications (
  created_at desc
);

create index if not exists
idx_notifications_priority
on public.notifications (
  priority
);


-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

alter table public.notifications
enable row level security;