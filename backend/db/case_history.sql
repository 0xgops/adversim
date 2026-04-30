-- AdverSim Case History schema for Neon Postgres.
-- Safe metadata only: no secrets, real user data, live target data, or executable content.

create table if not exists case_history (
  id bigserial primary key,
  session_id text not null default 'local-session',
  case_id text not null,
  title text not null,
  scenario_family text not null,
  difficulty text not null,
  severity text not null,
  target_user text not null,
  target_host text not null,
  confidence integer not null check (confidence between 0 and 100),
  staged_at timestamptz not null default now(),
  chart_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists case_history_session_staged_idx
  on case_history (session_id, staged_at desc);

create unique index if not exists case_history_session_case_idx
  on case_history (session_id, case_id);
