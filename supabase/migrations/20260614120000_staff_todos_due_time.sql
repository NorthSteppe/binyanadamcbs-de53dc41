-- Give staff tasks an optional time-of-day so they can be slotted on the calendar
-- like sessions. Previously staff_todos.due_date was date-only, so every task
-- rendered (and re-snapped) to a hardcoded 09:00 regardless of where it was placed.
ALTER TABLE public.staff_todos ADD COLUMN IF NOT EXISTS due_time time;
