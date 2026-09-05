alter table public.visitors
  add column if not exists chairman_decision text check (chairman_decision in ('accepted', 'rejected', 'waiting')),
  add column if not exists chairman_feedback text,
  add column if not exists hold_duration text,
  add column if not exists decision_at timestamp with time zone,
  add column if not exists purpose_original text,
  add column if not exists purpose_english text,
  add column if not exists origin_original text,
  add column if not exists origin_english text,
  add column if not exists input_language text default 'english';
